import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateTokens} from '../scripts/figma/token-contract.mjs';
import {contrastReport} from '../scripts/figma/contrast.mjs';

const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const bundle=validateTokens(await read('../design/figma/generated/tokens.json'),await read('../design/figma/config.json'));

// ADR-0002 §5: contrast decides stable status. The 0.5 contract must pass every pair in all twelve appearances.
test('every 0.5 contrast pair passes in all twelve appearances',()=>{
  const report=contrastReport(bundle);
  assert.equal(report.length,864);
  assert.deepEqual(report.filter(p=>!p.pass),[]);
});
test('the committed contrast evidence is reproducible from tokens.json',async()=>{
  assert.deepEqual(await read('../design/meridian/contrast-report.json'),contrastReport(bundle));
});
