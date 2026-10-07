import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { hash } from "./lib.mjs";
import { signature } from "./roundtrip.mjs";

test("actual plugin UI pins GitHub reads, imports remote changes, dispatches local changes once and pauses conflicts", async () => {
  const read = async (path) =>
    JSON.parse(await readFile(new URL(path, import.meta.url)));
  let remote = {
      tokens: await read("../../design/figma/generated/tokens.json"),
      content: await read("../../site/content.json"),
    },
    local = structuredClone(remote),
    context;
  const elements = Object.fromEntries(
    [
      "status",
      "token",
      "live",
      "compare",
      "import",
      "publish",
      "download",
      "disconnect",
    ].map((id) => [
      id,
      { value: "", checked: false, textContent: "", disabled: false },
    ]),
  );
  const calls = [];
  context = createContext({
    document: {
      querySelector: (id) => elements[id.slice(1)],
      querySelectorAll: () =>
        ["compare", "import", "publish", "download", "disconnect"].map(
          (id) => elements[id],
        ),
    },
    parent: {
      postMessage({ pluginMessage: m }) {
        let response;
        if (m.type === "export") response = { type: "tokens", ...local };
        else {
          assert.equal(m.expectedLocalSignature, signature(local));
          local = structuredClone(m.bundle);
          response = { type: "imported", ...local };
        }
        queueMicrotask(() =>
          context.onmessage({ data: { pluginMessage: response } }),
        );
      },
    },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (url.endsWith("/git/ref/heads/main"))
        return {
          ok: true,
          json: async () => ({ object: { sha: "pinned-main-sha" } }),
        };
      if (url.includes("/contents/")) {
        assert.match(url, /ref=pinned-main-sha$/);
        return {
          ok: true,
          json: async () => ({
            content: Buffer.from(
              JSON.stringify(
                url.includes("tokens.json") ? remote.tokens : remote.content,
              ),
            ).toString("base64"),
          }),
        };
      }
      assert.ok(url.endsWith("/dispatches"));
      return { ok: true, status: 204 };
    },
    TextDecoder,
    TextEncoder,
    Uint8Array,
    atob,
    crypto: webcrypto,
    setTimeout,
    clearTimeout,
    setInterval() {},
    queueMicrotask,
    onmessage: null,
  });
  const html = await readFile(
    new URL("../../design/figma/plugin/ui.html", import.meta.url),
    "utf8",
  );
  runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1], context);
  elements.token.value = "fake-session-token";
  await elements.compare.onclick();
  assert.match(elements.status.textContent, /Figma and GitHub match/);
  assert.equal(elements.token.value, "");
  elements.live.checked = true;
  remote.content.fields.heroTitle.value = "GitHub changed shared copy";
  await runInContext('run(()=>compare("watch"))', context);
  assert.equal(
    local.content.fields.heroTitle.value,
    remote.content.fields.heroTitle.value,
  );
  local.content.fields.heroTitle.value = "Figma changed shared copy";
  const baseline = structuredClone(remote);
  await runInContext('run(()=>compare("watch"))', context);
  await runInContext('run(()=>compare("watch"))', context);
  const dispatches = calls.filter((c) => c.url.endsWith("/dispatches"));
  assert.equal(dispatches.length, 1);
  const event = JSON.parse(dispatches[0].options.body);
  assert.equal(event.event_type, "figma-tokens");
  assert.equal(event.client_payload.base_hash, hash(signature(baseline)));
  assert.equal(
    event.client_payload.content.fields.heroTitle.value,
    "Figma changed shared copy",
  );
  remote.content.fields.heroTitle.value = "Concurrent GitHub change";
  await runInContext('run(()=>compare("watch"))', context);
  assert.equal(elements.live.checked, false);
  assert.match(elements.status.textContent, /Both Figma and GitHub changed/);
  assert.equal(
    local.content.fields.heroTitle.value,
    "Figma changed shared copy",
  );
  elements.disconnect.onclick();
  assert.equal(runInContext("sessionToken", context), "");
});
