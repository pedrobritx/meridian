/**
 * Per-variant symbol SVG export. Every COMPONENT_SET named "Symbol / <name>" outside archive pages
 * contributes one SVG per variant, written to design/figma-export/icons/svg/<name>/<variant>.svg
 * by figma-sync.yml at each named version.
 */
const slug = (text) => String(text).toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "") || "default";
export function symbolVariants(document, archivePages = []) {
  const out = [];
  for (const page of document.children ?? []) {
    if (archivePages.includes(page.id)) continue;
    const stack = [page];
    while (stack.length) {
      const node = stack.pop();
      if (node.type === "COMPONENT_SET" && /^Symbol \/ /.test(node.name)) {
        const set = slug(node.name.replace(/^Symbol \/ /, ""));
        for (const variant of node.children ?? []) {
          if (variant.type !== "COMPONENT") continue;
          const values = variant.name.split(",").map((part) => part.split("=")[1] ?? part);
          out.push({ set, setId: node.id, variant: variant.name, id: variant.id, file: `${set}/${values.map(slug).join("-")}.svg` });
        }
        continue;
      }
      if (node.children) stack.push(...node.children);
    }
  }
  const seen = new Set();
  for (const item of out) {
    if (seen.has(item.file)) throw Error("Two symbol variants export to the same file: " + item.file);
    seen.add(item.file);
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}
export function isSafeSvg(text) {
  return typeof text === "string" && text.length < 200_000 && /^\s*<svg[\s>]/.test(text)
    && !/<script|on\w+\s*=|javascript:|<foreignObject/i.test(text);
}
