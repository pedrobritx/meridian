import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {guidance} from '../src/component-guidance.js';
const library=JSON.parse(await readFile(new URL('../site/library.json',import.meta.url),'utf8'));
test('every inventoried component has purpose, accessibility and an explicit semantic starting point',()=>{
 for(const c of library.groups.flatMap(g=>g.components)){
  const entry=guidance[c.name];assert.ok(entry,c.name);
  for(const key of ['purpose','accessibility','code'])assert.ok(entry[key]?.trim().length>0,c.name+'/'+key);
 }
});
