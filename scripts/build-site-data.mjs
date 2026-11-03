// Builds site/library.json, the website's view of the Figma component library, from the
// committed Figma export and the 1.0 reorganisation map. Run after either changes.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = async (p) => JSON.parse(await readFile(new URL(p, root), "utf8"));
export async function libraryData() {
  const inventory = await read("design/figma-export/components/inventory-components-page.json");
  const shots = await read("design/figma-export/components/screenshots.json");
  const map = await read("design/figma/migrations/2026-11-01-reorganise/map.json");
  const glass = new Set(["386:2125", "510:2238", "510:2279", "510:2280"]);
  const groups = map.pages.filter((p) => p.key.startsWith("c-") && p.key !== "c-overview")
    .map((p) => ({ key: p.key.slice(2), name: p.name.replace("Components / ", ""), components: [] }));
  const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));
  const shotFor = Object.fromEntries(shots.items.map((s) => [s.componentId, s.file.replace("screenshots/", "")]));
  for (const item of inventory.items) {
    const group = byKey[map.componentGroups.assignments[item.id].slice(2)];
    const properties = Object.entries(item.props ?? {}).map(([name, prop]) => ({
      name: name.split("#")[0],
      kind: prop.v ? "variant" : prop.t === "TEXT" ? "text" : prop.t === "BOOLEAN" ? "boolean" : prop.t === "INSTANCE_SWAP" ? "instance" : "other",
      ...(prop.v ? { options: prop.v } : {}),
    }));
    group.components.push({
      id: item.id,
      name: item.name,
      kind: item.t === "SET" ? "Component set" : "Component",
      variants: item.nv ?? 1,
      status: item.name.startsWith("Universal /") || glass.has(item.id) ? "Preview" : "Candidate",
      properties,
      screenshot: shotFor[item.id] ?? null,
      figma: `https://www.figma.com/design/${map.fileKey}/Meridian?node-id=${item.id.replace(":", "-")}`,
    });
  }
  for (const g of groups) g.components.sort((a, b) => a.name.localeCompare(b.name));
  return {
    schemaVersion: 1,
    source: "design/figma-export (Figma read 2026-11-01) and design/figma/migrations/2026-11-01-reorganise/map.json",
    statusRule: "Preview items (the Universal prototypes and the glass set) may still change. Candidates can become stable once they pass the Definition of ready review, which has not happened yet.",
    groups,
  };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  await writeFile(new URL("site/library.json", root), JSON.stringify(await libraryData(), null, 2) + "\n");
  console.log("site/library.json written");
}
