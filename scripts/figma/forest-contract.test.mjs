import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {forestPalettes} from '../../lab/forest-reference/forest-model.js';
import {
  FOREST_ROLES,validateForestContract,planForestImport,
  figmaColorToHex,hexToFigmaColor
} from './forest-contract.mjs';
const remote=JSON.parse(await readFile(new URL('../../design/figma/forest-lab.json',import.meta.url),'utf8'));
const template={...remote,fields:Object.fromEntries(
  Object.entries(remote.fields).map(([k,v])=>[k,{nodeId:v.nodeId,pageId:v.pageId}]))};

test('Forest Figma contract is pinned to the actual prepared file and experimental page',()=>{
  assert.equal(remote.fileKey,'aJ2f6aYX9KBucAdPsCmkXn');
  assert.equal(remote.pageId,'218:21');
  assert.equal(remote.collectionName,'Meridian 0.6 Lab / Forest');
  assert.equal(Object.keys(remote.fields).length,6);
  assert.deepEqual(Object.keys(remote.modes),['Dawn','Dusk']);
  assert.deepEqual(validateForestContract(remote,template).modes,remote.modes);
});

test('Figma Forest token values are exactly the Lab source; stable 0.5 never supplies palette data',()=>{
  assert.deepEqual(Object.keys(forestPalettes.dawn),FOREST_ROLES);
  assert.deepEqual(Object.keys(forestPalettes.dusk),FOREST_ROLES);
  assert.deepEqual(remote.modes.Dawn,forestPalettes.dawn);
  assert.deepEqual(remote.modes.Dusk,forestPalettes.dusk);
  for(const mode of Object.values(remote.modes)){
    for(const hex of Object.values(mode))
      assert.equal(figmaColorToHex(hexToFigmaColor(hex)),hex);
  }
});

test('Forest importer only plans updated Lab tokens and six allowlisted text nodes',()=>{
  const local=structuredClone(remote);
  local.modes.Dawn.text='#000000';
  local.fields.duskDescription.value='User-edited Dusk annotation';
  const plan=planForestImport(remote,local,template);
  assert.deepEqual(plan.values,[{mode:'Dawn',role:'text',from:'#000000',to:remote.modes.Dawn.text}]);
  assert.deepEqual(plan.texts,[{name:'duskDescription',nodeId:'219:71',
    from:'User-edited Dusk annotation',to:remote.fields.duskDescription.value}]);
  assert.deepEqual(planForestImport(remote,remote,template),{values:[],texts:[]});
});

test('Forest importer refuses unexpected pages, nodes, roles, modes and invalid colours',()=>{
  for(const mutation of [
    c=>{c.pageId='3:208';},
    c=>{c.collectionName='Meridian / Colour';},
    c=>{c.fields.dawnTitle.nodeId='5:2';},
    c=>{c.fields.unapproved={nodeId:'9:9',pageId:remote.pageId,value:'Bad'};},
    c=>{c.modes.Dawn.text='orange';},
    c=>{delete c.modes.Dusk;},
    c=>{delete c.modes.Dawn.surface;}
  ]){
    const candidate=structuredClone(remote);mutation(candidate);
    assert.throws(()=>validateForestContract(candidate,template));
  }
  assert.throws(()=>figmaColorToHex({r:1,g:1,b:1,a:.5}));
});
