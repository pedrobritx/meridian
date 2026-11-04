/** Build the website's component inventory from the same approved document as previews. */
export function componentInventory(document, assignments, fileKey, version) {
  const nodes = new Map();
  function visit(node, page, parent) {
    if (node.type === 'CANVAS') page = {id: node.id, name: node.name};
    nodes.set(node.id, {node, page, parent});
    for (const child of node.children ?? []) visit(child, page, node);
  }
  visit(document);
  const items = Object.keys(assignments).map(id => {
    const entry = nodes.get(id);
    if (!entry || !['COMPONENT', 'COMPONENT_SET'].includes(entry.node.type))
      throw new Error(`Approved version lacks catalogued component ${id}`);
    const {node, page, parent} = entry;
    const props = Object.fromEntries(Object.entries(node.componentPropertyDefinitions ?? {}).map(([name, p]) => [name,
      p.type === 'VARIANT' ? {v: p.variantOptions ?? [], d: p.defaultValue} : {t: p.type, d: p.defaultValue},
    ]));
    const variants = (node.children ?? []).filter(n => n.type === 'COMPONENT');
    if (!page || (node.type === 'COMPONENT_SET' && !variants.length))
      throw new Error(`Invalid catalogued component structure: ${id}`);
    return {id, t: node.type === 'COMPONENT_SET' ? 'SET' : 'COMP', name: node.name,
      in: parent?.name ?? '', page, props,
      ...(node.type === 'COMPONENT_SET' ? {nv: variants.length, def: variants[0]?.id} : {})};
  });
  return {_label: 'Captured from approved Figma REST document; catalogued roots across all purpose pages.',
    fileKey, versionId: version.id, capturedAt: version.created_at, count: items.length, items};
}
