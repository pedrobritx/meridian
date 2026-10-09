import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {universalComponents,universalGroups,componentsFor} from '../src/universal/catalog.js';
import {symbolNames,iconMarkup} from '../src/universal/symbols.js';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const snapshot=await read('../design/meridian/figma-refactor-map.json');
const icons=await read('../design/meridian/universal-symbols.json');
test('all 92 families have unique ids and are searchable across disciplines',()=>{
 assert.equal(universalComponents.length,92);
 assert.equal(new Set(universalComponents.map(x=>x.id)).size,92);
 assert.equal(universalGroups.length,5);
 assert.ok(componentsFor({search:'carousel'}).some(x=>x.id==='carousel'));
 assert.ok(componentsFor({search:'date range'}).some(x=>x.id==='date-range'));
 assert.ok(componentsFor({project:'verbalis'}).some(x=>x.id==='translation-segment'));
 assert.ok(componentsFor({group:'Feedback & trust'}).some(x=>x.id==='progress-ring'));
});
test('Meridian Figma structure preserves Start, 0.5 master collections and native source IDs',()=>{
 assert.equal(snapshot.figma.sourceStartNode,'7:2');
 assert.equal(snapshot.pages.length,26);
 assert.equal(new Set(snapshot.pages.map(x=>x[0])).size,26);
 assert.equal(snapshot.environment.collectionId,'VariableCollectionId:266:34');
 assert.equal(snapshot.environment.roleCount,39);
 assert.equal(snapshot.environment.modes.length,10);
 assert.equal(snapshot.universal.familyCount,92);
 assert.equal(snapshot.universal.icons.families,80);
 assert.deepEqual(snapshot.universal.icons.styles,['Outline','Filled','Colour','Duotone']);
 assert.equal(snapshot.compatibility.legacyTokenModeIdsPreserved,true);
});
test('all 80 original symbols retain safe vector paths, with separate Figma four-style contract',()=>{
 assert.equal(icons.icons.length,80);
 assert.equal(new Set(icons.icons.map(x=>x.name)).size,80);
 for(const icon of icons.icons){
  assert.match(icon.path,/^<(?:path|rect|circle|ellipse|line|polygon)/);
  assert.doesNotMatch(icon.path,/<(?:script|foreignObject|image)\b|\bon\w+\s*=|https?:\/\//i);
  assert.ok(symbolNames.includes(icon.name));
  assert.match(iconMarkup(icon.name,{size:24}),/aria-hidden="true"/);
 }
});
