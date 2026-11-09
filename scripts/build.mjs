// Builds css/meridian.css and src/tokens.js from tokens/meridian.tokens.json.
// With --check, fails instead of writing when a generated file is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildCSS, buildModule } from './generate.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokens = JSON.parse(readFileSync(`${root}tokens/meridian.tokens.json`, 'utf8'));
const outputs = { 'css/meridian.css': buildCSS(tokens), 'src/tokens.js': buildModule(tokens) };
const check = process.argv.includes('--check');
let stale = 0;
for (const [path, text] of Object.entries(outputs)) {
  let current = null;
  try { current = readFileSync(root + path, 'utf8'); } catch {}
  if (current === text) continue;
  if (check) { console.error(`${path} is out of date: run npm run build`); stale++; continue; }
  writeFileSync(root + path, text);
  console.log(`wrote ${path}`);
}
process.exitCode = stale ? 1 : 0;
