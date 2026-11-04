// After a GitHub-first token edit, rebuild the provenance ledger so the contract test stays exact.
// Usage: node scripts/build-provenance-overrides.mjs "<source>" "<decision>"
import { readFile, writeFile } from "node:fs/promises";
import { captureFromSource, provenanceOverrides } from "./figma/provenance.mjs";
const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const [source, decision] = process.argv.slice(2);
if (!source || !decision) throw Error('Usage: node scripts/build-provenance-overrides.mjs "<source>" "<decision>"');
const ledger = provenanceOverrides(
  captureFromSource(await read("../design/figma/generated/figma-source.json")),
  await read("../design/figma/generated/tokens.json"),
  await read("../design/figma/generated/provenance-overrides.json"),
  { source, decision },
);
await writeFile(new URL("../design/figma/generated/provenance-overrides.json", import.meta.url), JSON.stringify(ledger, null, 2) + "\n");
console.log(ledger.overrides.length + " overrides");
