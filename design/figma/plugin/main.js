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
    if (message.type === 'exportForest' || message.type === 'importForest') {
      await handleForestMessage(message);
      return;
    }
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
        ?.resolvedType === "STRING" && !String(w.value).startsWith("cubic-bezier("),
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
        const segments = n.getStyledTextSegments(["fontName"]);
        if (!segments.length) segments.push({ fontName: n.fontName });
        for (const part of segments) {
          if (!part.fontName || part.fontName === figma.mixed)
            throw Error(
              "Resolve the missing/mixed font before importing shared text.",
            );
          await figma.loadFontAsync(part.fontName);
        }
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

/**
 * Forest-only counterpart to the stable 0.5 token/copy bridge.
 * No component creation, deletion, layout rewriting, or stable token editing.
 */
async function captureForest() {
  if (figma.fileKey && figma.fileKey !== forestTemplate.fileKey)
    throw Error('Wrong Figma file for Forest Lab');
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const c = collections.find(x=>x.name===forestTemplate.collectionName);
  if (!c) throw Error('Forest Lab collection missing. Open the prepared Forest design.');
  const modeByName=Object.fromEntries(c.modes.map(m=>[m.name,m.modeId]));
  if (!modeByName.Dawn || !modeByName.Dusk || c.modes.length!==2)
    throw Error('Forest collection must have only Dawn and Dusk');
  const variables = (await Promise.all(c.variableIds.map(id=>figma.variables.getVariableByIdAsync(id)))).filter(Boolean);
  const byName=new Map(variables.map(v=>[v.name,v]));
  if (variables.length!==FOREST_ROLES.length ||
      FOREST_ROLES.some(name=>byName.get(name)?.resolvedType!=='COLOR'))
    throw Error('Forest variable roles changed; manual mapping review required');
  const modes={};
  for (const mode of ['Dawn','Dusk']) {
    modes[mode]={};
    for (const role of FOREST_ROLES) {
      const value=byName.get(role).valuesByMode[modeByName[mode]];
      if (!value || value.type==='VARIABLE_ALIAS') throw Error('Forest direct palette expected: '+role);
      modes[mode][role]=figmaColorToHex(value);
    }
  }
  const fields={};
  for (const [name,config] of Object.entries(forestTemplate.fields)) {
    const node=await figma.getNodeByIdAsync(config.nodeId);
    if (node?.type!=='TEXT') throw Error('Missing Forest text: '+name);
    let parent=node;
    while(parent && parent.type!=='PAGE') parent=parent.parent;
    if(parent?.id!==forestTemplate.pageId)throw Error('Forest text moved to an unapproved page: '+name);
    fields[name]={...config,pageId:forestTemplate.pageId,value:node.characters};
  }
  return {forest:validateForestContract({
    schemaVersion:1,fileKey:forestTemplate.fileKey,pageId:forestTemplate.pageId,
    collectionName:forestTemplate.collectionName,source:forestTemplate.source,modes,fields
  },forestTemplate), collection:c, modeByName, byName};
}

async function handleForestMessage(message) {
  try {
    const local=await captureForest();
    if(message.type==='exportForest') {
      figma.ui.postMessage({type:'forestSnapshot',forest:local.forest});
      return;
    }
    if(message.type!=='importForest') return;
    if(signature(local.forest)!==message.expectedLocalSignature)
      throw Error('Forest changed since compare; retry after review');
    const candidate=validateForestContract(message.forest,forestTemplate);
    const plan=planForestImport(candidate,local.forest,forestTemplate);
    const textNodes=[];
    for(const field of plan.texts) {
      const node=await figma.getNodeByIdAsync(field.nodeId);
      if(node?.type!=='TEXT')throw Error('Missing Forest edit target');
      const segments=node.getStyledTextSegments(['fontName']);
      if(!segments.length)segments.push({fontName:node.fontName});
      for(const item of segments) {
        if(!item.fontName || item.fontName===figma.mixed)
          throw Error('Unresolved Forest font on '+field.name);
        await figma.loadFontAsync(item.fontName);
      }
      textNodes.push({...field,node});
    }
    const rechecked=await captureForest();
    if(signature(rechecked.forest)!==message.expectedLocalSignature)
      throw Error('Forest changed during font preparation; no write made');
    const changedValues=[], changedTexts=[];
    try {
      for(const cell of plan.values){
        const variable=rechecked.byName.get(cell.role);
        const mode=rechecked.modeByName[cell.mode];
        variable.setValueForMode(mode,hexToFigmaColor(cell.to));
        changedValues.push({...cell,variable,mode});
      }
      for(const field of textNodes){
        field.node.characters=field.to;
        changedTexts.push(field);
      }
    }catch(error){
      for(const field of changedTexts.reverse())field.node.characters=field.from;
      for(const cell of changedValues.reverse())
        cell.variable.setValueForMode(cell.mode,hexToFigmaColor(cell.from));
      throw error;
    }
    const verified=await captureForest();
    if(signature(verified.forest)!==signature(candidate))
      throw Error('Forest verification differs after import. Review Figma manually.');
    figma.ui.postMessage({type:'forestImported',forest:verified.forest,
      variableCells:plan.values.length,textNodes:plan.texts.length});
  }catch(error){
    figma.ui.postMessage({type:'error',message:error.message});
  }
}
