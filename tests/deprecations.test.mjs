import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const table=await read('../design/meridian/deprecations.json');
const manifest=await read('../design/meridian/living-environments.json');

test('every deprecation names a replacement, a window and points at environments that exist',()=>{
  assert.equal(table.schemaVersion,1);
  const ids=new Set(manifest.environments.map(e=>e.id));
  for(const entry of table.entries){
    for(const key of ['use','replacement','deprecatedIn','removeNoEarlierThan','compatibility'])assert.ok(entry[key],entry.use+' needs '+key);
    for(const [,id] of entry.replacement.matchAll(/data-meridian-environment=\\?"([a-z]+)\\?"/g))assert.ok(ids.has(id),id);
  }
});
