figma.showUI(__html__, { width: 480, height: 600 });
async function capture() {
  if (figma.fileKey && figma.fileKey !== fileKey)
    throw Error("Open the configured Meridian file");
  const collections = await figma.variables.getLocalVariableCollectionsAsync(),
    variables = await figma.variables.getLocalVariablesAsync();
  const tokens = captureNativeTokens(collections, variables);
  const fields = {};
  for (const [name, field] of Object.entries(contentTemplate.fields)) {
    const n = await figma.getNodeByIdAsync(field.nodeId);
    if (n?.type !== "TEXT") throw Error("Missing shared text: " + name);
    fields[name] = { ...field, value: n.characters };
  }
  return {
    tokens,
    content: validateContent(
      { schemaVersion: 1, fileKey, fields },
      contentTemplate,
    ),
    collections,
    variables,
  };
}
figma.ui.onmessage = async (message) => {
  try {
    const local = await capture();
    const bundle = { tokens: local.tokens, content: local.content };
    if (message.type === "export") {
      figma.ui.postMessage({ type: "tokens", ...bundle });
      return;
    }
    if (message.type !== "import") return;
    if (signature(bundle) !== message.expectedLocalSignature)
      throw Error(
        "Figma changed since comparison. Compare again before importing.",
      );
    const content = validateContent(message.bundle.content, contentTemplate);
    const writes = planTokenImport(
      message.bundle.tokens,
      local.collections,
      local.variables,
    );
    const familyWrites = writes.filter((w) =>
      local.variables
        .find((v) => v.id === w.id)
        ?.scopes?.includes("FONT_FAMILY"),
    );
    if (familyWrites.length) {
      const families = new Set(
        familyWrites.flatMap((w) => [w.value, w.current]),
      );
      const fonts = await figma.listAvailableFontsAsync();
      for (const font of fonts.filter((f) => families.has(f.fontName.family)))
        await figma.loadFontAsync(font.fontName);
    }
    const texts = [];
    for (const [name, field] of Object.entries(content.fields)) {
      const n = await figma.getNodeByIdAsync(field.nodeId);
      if (n?.type !== "TEXT") throw Error("Missing shared text");
      if (n.characters !== field.value) {
        for (const part of n.getStyledTextSegments(["fontName"]))
          await figma.loadFontAsync(part.fontName);
        texts.push({ n, old: n.characters, value: field.value });
      }
    }
    // Font loading yields to the editor; protect edits made during preparation.
    const prepared = await capture();
    if (
      signature({ tokens: prepared.tokens, content: prepared.content }) !==
      message.expectedLocalSignature
    )
      throw Error("Figma changed while preparing the import. Compare again.");
    const vs = Object.fromEntries(local.variables.map((v) => [v.id, v]));
    const applied = [],
      edited = [];
    try {
      for (const w of writes) {
        vs[w.id].setValueForMode(w.modeId, w.value);
        applied.push(w);
      }
      for (const t of texts) {
        t.n.characters = t.value;
        edited.push(t);
      }
    } catch (error) {
      for (const t of edited.reverse()) t.n.characters = t.old;
      for (const w of applied.reverse())
        vs[w.id].setValueForMode(w.modeId, w.current);
      throw error;
    }
    const next = await capture();
    figma.ui.postMessage({
      type: "imported",
      tokens: next.tokens,
      content: next.content,
      variableCells: writes.length,
      textNodes: texts.length,
    });
  } catch (error) {
    figma.ui.postMessage({ type: "error", message: error.message });
  }
};
