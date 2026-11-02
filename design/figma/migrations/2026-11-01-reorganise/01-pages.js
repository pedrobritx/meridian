// Step 1 (root only, no page switch): create, rename and order the library pages.
// Idempotent: existing pages are found by id or name; nothing is deleted.
const plan = [
  ['Cover', '0:1'], ['Getting started', null], ['Changelog', null], ['Foundations', '197:34'],
  ['Symbols', null], ['Components / Overview', '3:208'], ['Components / Actions', null],
  ['Components / Selection', null], ['Components / Text input', null], ['Components / Containment', null],
  ['Components / Navigation', null], ['Components / Communication', null], ['Components / Data and media', null],
  ['Templates', null], ['Website / Develop', '3:211'], ['Website / Foundations', '3:207'],
  ['Lab / Studies', null], ['Lab / Archive', '218:21'],
];
const result = { renamed: [], created: [], order: [] };
// Rename existing pages first so new names never collide with old ones ("Foundations").
for (const [name, id] of plan) if (id) {
  const page = await figma.getNodeByIdAsync(id);
  if (!page || page.type !== 'PAGE') throw Error('Missing page ' + id);
  if (page.name !== name) { result.renamed.push({ id, from: page.name, to: name }); page.name = name; }
}
const ids = [];
for (const [name, id] of plan) {
  let page = id ? await figma.getNodeByIdAsync(id) : figma.root.children.find(p => p.name === name);
  if (!page) { page = figma.createPage(); page.name = name; result.created.push({ id: page.id, name }); }
  ids.push(page.id);
}
ids.forEach((id, index) => figma.root.insertChild(index, figma.root.children.find(p => p.id === id)));
result.order = figma.root.children.map(p => ({ id: p.id, name: p.name }));
return result;
