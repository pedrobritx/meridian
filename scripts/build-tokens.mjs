import { readFile, writeFile } from "node:fs/promises";
import {
  tokenCss,
  validateTokens,
  websiteCss,
} from "./figma/token-contract.mjs";
const read = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url)));
const bundle = validateTokens(
  await read("../design/figma/generated/tokens.json"),
  await read("../design/figma/config.json"),
);
// The site consumes the same reviewed bundle that the Figma bridge publishes.
await writeFile(
  new URL("../styles/tokens.css", import.meta.url),
  websiteCss(bundle),
);
await writeFile(
  new URL("../design/figma/generated/meridian.css", import.meta.url),
  tokenCss(bundle),
);
