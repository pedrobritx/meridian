import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  captureNativeTokens,
  planTokenImport,
  signature,
  syncDirection,
  extractContent,
  validateContent,
} from "./roundtrip.mjs";
const read = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url)));
const source = await read("../../design/figma/generated/figma-source.json"),
  content = await read("../../site/content.json");
const variables = source.collections.flatMap((c) =>
  c.variables.map((v) => ({
    ...v,
    variableCollectionId: c.id,
    resolvedType: v.type,
    valuesByMode: v.values,
  })),
);

const bundle = captureNativeTokens(source.collections, variables);
test("bidirectional comparison imports, publishes, stops conflicts and tolerates Figma float precision", () => {
  const base = { value: 0.12345678 },
    same = { value: 0.123456781 },
    local = { value: 0.5 },
    remote = { value: 0.8 };
  assert.equal(syncDirection(base, same, base), "equal");
  assert.equal(syncDirection(base, base, remote), "import");
  assert.equal(syncDirection(base, local, base), "publish");
  assert.equal(syncDirection(base, local, remote), "conflict");
  assert.equal(syncDirection(null, local, remote), "choose");
});
test("native alias-preserving import plans no writes for matching values", () => {
  assert.deepEqual(planTokenImport(bundle, source.collections, variables), []);
});
test("shared primitive edits require coherent semantic values and target one leaf cell", () => {
  const candidate = structuredClone(bundle);
  candidate.modes.Dawn["radius/md"].value = 28;
  assert.throws(
    () => planTokenImport(candidate, source.collections, variables),
    /Shared alias has conflicting values/,
  );
  for (const mode of Object.values(candidate.modes))
    for (const [name, token] of Object.entries(mode))
      if (name.startsWith("radius/") && token.value === 24) token.value = 28;
  const writes = planTokenImport(candidate, source.collections, variables);
  assert.ok(writes.length > 0);
  for (const write of writes) {
    assert.equal(write.value, 28);
    assert.notEqual(write.current?.type, "VARIABLE_ALIAS");
  }
});
test("content mapping rejects arbitrary nodes and obsolete versions", () => {
  const candidate = structuredClone(content);
  candidate.fields.heroTitle.nodeId = "unmapped";
  assert.throws(
    () => validateContent(candidate, content),
    /Invalid shared-content/,
  );
  assert.throws(
    () => extractContent({ id: "0:0", children: [] }, content),
    /Save a new version/,
  );
  const document = {
    id: "0:0",
    children: Object.values(content.fields).map((f) => ({
      id: f.nodeId,
      type: "TEXT",
      characters: f.value,
    })),
  };
  assert.equal(
    signature(extractContent(document, content)),
    signature(content),
  );
});
