import {readFile,writeFile} from 'node:fs/promises';
import {environmentCss} from '../src/universal/environment-tokens.mjs';
const manifest=JSON.parse(await readFile(new URL('../design/meridian/living-environments.json',import.meta.url),'utf8'));
const compatibility=JSON.parse(await readFile(new URL('../design/meridian/compatibility/environments-2026-11-02.json',import.meta.url),'utf8'));
await writeFile(new URL('../styles/living-environments.css',import.meta.url),environmentCss(manifest,compatibility),'utf8');
