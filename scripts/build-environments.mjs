import {readFile,writeFile} from 'node:fs/promises';
import {environmentCss} from '../src/universal/environment-tokens.mjs';
const manifest=JSON.parse(await readFile(new URL('../design/meridian/living-environments.json',import.meta.url),'utf8'));
await writeFile(new URL('../styles/living-environments.css',import.meta.url),environmentCss(manifest),'utf8');
