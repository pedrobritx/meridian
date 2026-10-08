import { websiteCss } from "../scripts/figma/token-contract.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateTokens } from "../scripts/figma/lib.mjs";

test("website CSS consumes the complete current Figma contract in all twelve modes", async () => {
  const root = new URL("../", import.meta.url),
    read = (path) => readFile(new URL(path, root), "utf8");
  const bundle = validateTokens(
    JSON.parse(await read("design/figma/generated/tokens.json")),
    JSON.parse(await read("design/figma/config.json")),
  );
  assert.equal(
    await read("styles/tokens.css"),
    websiteCss(bundle),
    "the website must use the canonical snapshot, including profile selectors",
  );
});
