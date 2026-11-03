import { readFile, writeFile } from 'node:fs/promises';
import { validateTokens } from './figma/token-contract.mjs';
import { contrastReport } from './figma/contrast.mjs';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const bundle = validateTokens(await read('../design/figma/generated/tokens.json'), await read('../design/figma/config.json'));
const report = contrastReport(bundle);
if (report.some(p=>!p.pass)) throw Error('Contrast failure: '+JSON.stringify(report.filter(p=>!p.pass)));
await writeFile(new URL('../design/meridian/contrast-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log({pairs:report.length,pass:true,minText:Math.min(...report.filter(p=>p.minimum===4.5).map(p=>p.ratio)),minControl:Math.min(...report.filter(p=>p.minimum===3).map(p=>p.ratio))});
