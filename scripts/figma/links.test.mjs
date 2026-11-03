import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { linkStatus } from "./links.mjs";

const links = JSON.parse(await readFile(new URL("../../design/figma/links.json", import.meta.url), "utf8"));

test("link status separates live, archived and missing nodes and keeps page references live", () => {
  const document = { children: [
    { id: "0:1", name: "Cover", children: [{ id: "341:2", children: [{ id: "341:3" }] }] },
    { id: "218:21", name: "Lab / Archive", children: [{ id: "7:2" }] },
  ] };
  const result = linkStatus(document, { ...links, known: ["341:3", "7:2", "218:21", "92:34"] }, "2026-11-02");
  assert.deepEqual(result.missing, ["92:34"]);
  assert.deepEqual(result.archived, ["7:2"]);
  assert.deepEqual(result.pages, { "0:1": "Cover", "218:21": "Lab / Archive" });
  assert.equal(result.checkedAt, "2026-11-02");
  assert.deepEqual(result.policy, links.policy);
});
