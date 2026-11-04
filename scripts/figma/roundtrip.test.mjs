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
test("0.5 capture ignores 0.6 collections and internal motion/liquid aliases in the same file", () => {
  // Mirrors the Figma file as exported on 2026-11-01: 0.6 collections whose modes are
  // environments or appearances, and motion/liquid/* variables inside Meridian / Motion.
  const collections = structuredClone(source.collections);
  const motion = collections.find((c) => c.name === "Meridian / Motion");
  const primitives = collections.find((c) => c.name === "Meridian / Primitives");
  primitives.variables.push({ id: "VariableID:t:1", name: "optics/motion/liquid/duration/feedback", type: "FLOAT", values: { [primitives.modes[0].modeId]: 120 }, scopes: [], code: "" });
  motion.variables.push({ id: "VariableID:t:2", name: "motion/liquid/duration/feedback", type: "FLOAT",
    values: Object.fromEntries(motion.modes.map((m) => [m.modeId, { type: "VARIABLE_ALIAS", id: "VariableID:t:1" }])), scopes: [], code: "" });
  for (const [id, name, modeNames] of [
    ["VariableCollectionId:t:3", "Meridian / Environment", ["Forest", "Core"]],
    ["VariableCollectionId:t:4", "Meridian / Appearance", ["Dawn", "Dusk"]],
    ["VariableCollectionId:t:5", "Meridian / Living Environments · 0.6", ["Forest / Dawn", "Forest / Dusk"]],
    ["VariableCollectionId:t:6", "Meridian / Material", ["Value"]],
  ]) {
    const modes = modeNames.map((n, i) => ({ name: n, modeId: id + ":" + i }));
    collections.push({ id, name, modes, variables: [{ id: id + ":v", name: "color/bg/page", type: "COLOR",
      values: Object.fromEntries(modes.map((m) => [m.modeId, { r: 0, g: 0, b: 0, a: 1 }])), scopes: ["FRAME_FILL"], code: "" }] });
  }
  const vs = collections.flatMap((c) => c.variables.map((v) => ({ ...v, variableCollectionId: c.id, resolvedType: v.type, valuesByMode: v.values })));
  assert.deepEqual(captureNativeTokens(collections, vs), bundle);
  assert.deepEqual(planTokenImport(bundle, collections, vs), []);
});
