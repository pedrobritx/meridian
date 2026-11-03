// Step 2 (source page: Foundations, formerly Style, 197:34): move Icons to Symbols and the
// review frames to Lab / Studies. Reparenting keeps node IDs. Safe to retry.
const page = await figma.getNodeByIdAsync('197:34');
await figma.setCurrentPageAsync(page);
const byName = n => figma.root.children.find(p => p.name === n);
// The two review frames sit inside Icons, so they move out before Icons itself moves.
const moves = [['450:12511', 'Lab / Studies'], ['450:13627', 'Lab / Studies'], ['387:1789', 'Lab / Studies'], ['339:357', 'Symbols']];
const moved = [];
for (const [id, target] of moves) {
  const node = await figma.getNodeByIdAsync(id), dest = byName(target);
  if (!node || !dest) throw Error('Missing ' + (node ? target : id));
  if (node.parent?.id === dest.id) continue;
  const x = node.absoluteTransform[0][2], y = node.absoluteTransform[1][2];
  dest.appendChild(node); node.x = x; node.y = y;
  moved.push({ id, to: dest.id });
}
return { moved };
