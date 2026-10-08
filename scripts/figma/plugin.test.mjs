import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { validateTokens } from "./lib.mjs";
import { captureNativeTokens } from "./roundtrip.mjs";

test("actual plugin resolves native aliases and exports the complete semantic snapshot", async () => {
  const read = async (path) =>
    JSON.parse(await readFile(new URL(path, import.meta.url)));
  const source = await read("../../design/figma/generated/figma-source.json");
  const expected = captureNativeTokens(
    source.collections,
    source.collections.flatMap((c) =>
      c.variables.map((v) => ({
        id: v.id,
        name: v.name,
        variableCollectionId: c.id,
        resolvedType: v.type,
        valuesByMode: v.values,
      })),
    ),
  );
  const config = await read("../../design/figma/config.json");
  const content = await read("../../site/content.json");
  let result;
  const figma = {
    fileKey: config.fileKey,
    showUI() {},
    async getNodeByIdAsync(id) {
      const field = Object.values(content.fields).find((f) => f.nodeId === id);
      return field ? { type: "TEXT", characters: field.value } : null;
    },
    ui: {
      postMessage(message) {
        result = message;
      },
    },
    variables: {
      async getLocalVariableCollectionsAsync() {
        return source.collections;
      },
      async getLocalVariablesAsync() {
        return source.collections.flatMap((c) =>
          c.variables.map((v) => ({
            id: v.id,
            name: v.name,
            variableCollectionId: c.id,
            resolvedType: v.type,
            valuesByMode: v.values,
          })),
        );
      },
    },
  };
  runInNewContext(
    await readFile(
      new URL("../../design/figma/plugin/code.js", import.meta.url),
      "utf8",
    ),
    { figma, __html__: "" },
  );
  await figma.ui.onmessage({ type: "export" });
  assert.equal(result.type, "tokens");
  assert.deepEqual(
    validateTokens(JSON.parse(JSON.stringify(result.tokens)), config),
    validateTokens(expected, config),
  );
  const colour = source.collections.find((c) => c.name === "Meridian / Colour");
  colour.modes = colour.modes.filter((m) => m.name !== "Paper / Dusk");
  await figma.ui.onmessage({ type: "export" });
  assert.equal(result.type, "error");
  assert.match(result.message, /Missing profile mode/);
});

test("actual plugin imports mapped text and primitive values, rejects stale comparison and rolls back failed writes", async () => {
  const read = async (path) =>
    JSON.parse(await readFile(new URL(path, import.meta.url)));
  const source = await read("../../design/figma/generated/figma-source.json"),
    content = await read("../../site/content.json");
  const { signature } = await import("./roundtrip.mjs");
  const variables = source.collections.flatMap((c) =>
    c.variables.map((v) => ({
      id: v.id,
      name: v.name,
      variableCollectionId: c.id,
      resolvedType: v.type,
      valuesByMode: structuredClone(v.values),
      setValueForMode(mode, value) {
        this.valuesByMode[mode] = value;
      },
    })),
  );
  const tokens = captureNativeTokens(source.collections, variables);
  let fail = false,
    result;
  const nodes = Object.fromEntries(
    Object.values(content.fields).map((f) => {
      let characters = f.value;
      return [
        f.nodeId,
        {
          type: "TEXT",
          fontName: { family: "Manrope", style: "Regular" },
          get characters() {
            return characters;
          },
          set characters(value) {
            if (fail && f.nodeId === content.fields.heroTitle.nodeId)
              throw Error("Simulated text-write failure");
            characters = value;
          },
          getStyledTextSegments() {
            return characters.length
              ? [{ fontName: { family: "Manrope", style: "Regular" } }]
              : [];
          },
        },
      ];
    }),
  );
  const figma = {
    fileKey: tokens.fileKey,
    showUI() {},
    getNodeByIdAsync: async (id) => nodes[id],
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => source.collections,
      getLocalVariablesAsync: async () => variables,
    },
    ui: { postMessage: (m) => (result = m) },
  };
  runInNewContext(
    await readFile(
      new URL("../../design/figma/plugin/code.js", import.meta.url),
      "utf8",
    ),
    { figma, __html__: "" },
  );
  const original = { tokens, content },
    candidate = structuredClone(original);
  candidate.content.fields.heroTitle.value = "Edited in GitHub";
  for (const mode of Object.values(candidate.tokens.modes))
    for (const [name, token] of Object.entries(mode))
      if (name.startsWith("radius/") && token.value === 24) token.value = 28;
  await figma.ui.onmessage({
    type: "import",
    bundle: candidate,
    expectedLocalSignature: "stale",
  });
  assert.equal(result.type, "error");
  assert.match(result.message, /Figma changed since/);
  fail = true;
  await figma.ui.onmessage({
    type: "import",
    bundle: candidate,
    expectedLocalSignature: signature(original),
  });
  assert.equal(result.type, "error");
  assert.match(result.message, /Simulated text-write failure/);
  await figma.ui.onmessage({ type: "export" });
  assert.equal(
    signature({ tokens: result.tokens, content: result.content }),
    signature(original),
    "failed imports roll primitive changes back",
  );
  fail = false;
  await figma.ui.onmessage({
    type: "import",
    bundle: candidate,
    expectedLocalSignature: signature(original),
  });
  assert.equal(result.type, "imported");
  assert.ok(result.variableCells > 0);
  assert.equal(result.textNodes, 1);
  assert.equal(
    signature({ tokens: result.tokens, content: result.content }),
    signature(candidate),
  );
  nodes[content.fields.heroTitle.nodeId].characters = "";
  await figma.ui.onmessage({ type: "export" });
  await figma.ui.onmessage({
    type: "import",
    bundle: candidate,
    expectedLocalSignature: signature({
      tokens: result.tokens,
      content: result.content,
    }),
  });
  assert.equal(
    result.type,
    "imported",
    "an empty mapped layer can be refilled after loading its font",
  );
  const aliasesBefore = source.collections.flatMap((c) =>
    c.variables.flatMap((v) =>
      Object.entries(v.values)
        .filter(([, value]) => value.type === "VARIABLE_ALIAS")
        .map(([mode, value]) => ({ id: v.id, mode, value })),
    ),
  );
  for (const { id, mode, value } of aliasesBefore)
    assert.deepEqual(
      variables.find((v) => v.id === id).valuesByMode[mode],
      value,
      "bindings remain aliases",
    );
});
