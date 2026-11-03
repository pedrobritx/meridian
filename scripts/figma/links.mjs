/**
 * Figma link status for design/figma/links.json. The named-version export recomputes it from
 * the Figma file document, so every export PR shows which repo-referenced nodes moved to an
 * archive page or disappeared; tests/figma-links.test.mjs then enforces the policy offline.
 */
const order = (a, b) => {
  const [x1, y1] = a.split(":").map(Number), [x2, y2] = b.split(":").map(Number);
  return x1 - x2 || y1 - y2;
};
export function pageIndex(document) {
  const index = new Map();
  for (const page of document.children ?? []) {
    const stack = [page];
    while (stack.length) {
      const node = stack.pop();
      index.set(node.id, page.id);
      if (node.children) stack.push(...node.children);
    }
  }
  return index;
}
export function linkStatus(document, links, checkedAt, method) {
  const index = pageIndex(document);
  const pageIds = new Set((document.children ?? []).map((p) => p.id));
  const missing = [], archived = [];
  for (const id of links.known) {
    const page = index.get(id);
    if (!page) missing.push(id);
    // A reference to a page itself only needs the page to exist.
    else if (!pageIds.has(id) && links.archivePages.includes(page)) archived.push(id);
  }
  return {
    ...links,
    checkedAt,
    method: method ?? links.method,
    pages: Object.fromEntries((document.children ?? []).map((p) => [p.id, p.name])),
    missing: missing.sort(order),
    archived: archived.sort(order),
  };
}
