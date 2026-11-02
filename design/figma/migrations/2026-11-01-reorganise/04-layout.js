// Step 4 (one call per page, parallel-safe): lay the page's top-level nodes out in rows,
// keeping their current order. Directory frames stay first at the top left.
const page = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(page);
const nodes = [...page.children].sort((a, b) => (/Directory$/.test(b.name) - /Directory$/.test(a.name)) || (a.y - b.y) || (a.x - b.x));
let x = 80, y = 100, rowHeight = 0; const maxWidth = 9000, gap = 200, placed = [];
for (const node of nodes) {
  if (x > 80 && x + node.width > maxWidth) { x = 80; y += rowHeight + gap; rowHeight = 0; }
  node.x = x; node.y = y; placed.push(node.id);
  x += node.width + gap; rowHeight = Math.max(rowHeight, node.height);
}
return { page: page.id, placed };
