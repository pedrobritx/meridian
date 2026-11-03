// Step 3 (source page: Components / Overview, formerly Components, 3:208). Run once per TARGET
// page by setting TARGET below. Moves whole sections, then gathers split-out components into a
// new section named after them. Reparenting keeps node IDs and component keys. Safe to retry.
const TARGET = '__TARGET__'; // e.g. 'Components / Actions'
const map = __MAP__;          // { sections: [...ids], splits: [{ section, nodes: [...] }] } for TARGET
const page = await figma.getNodeByIdAsync('3:208');
await figma.setCurrentPageAsync(page);
const dest = figma.root.children.find(p => p.name === TARGET);
if (!dest) throw Error('Missing page ' + TARGET);
const moved = [], created = [];
for (const id of map.sections) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw Error('Missing ' + id);
  if (node.parent?.id === dest.id) continue;
  dest.appendChild(node); moved.push(id);
}
for (const split of map.splits) {
  let section = dest.children.find(n => n.type === 'SECTION' && n.name === split.section);
  if (!section) { section = figma.createSection(); section.name = split.section; dest.appendChild(section); created.push(section.id); }
  let y = 160, width = 0;
  for (const id of split.nodes) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node) throw Error('Missing ' + id);
    if (node.parent?.id !== section.id) { section.appendChild(node); moved.push(id); }
    node.x = 80; node.y = y; y += node.height + 120; width = Math.max(width, node.width);
  }
  section.resizeWithoutConstraints(width + 160, y + 40);
}
return { target: dest.id, moved, createdSections: created };
