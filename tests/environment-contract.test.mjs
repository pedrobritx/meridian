import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateEnvironmentManifest,environmentCss,contrastRatio} from '../src/universal/environment-tokens.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const manifest=await read('../design/meridian/living-environments.json');
const legacy=await read('../design/figma/generated/tokens.json');
const hex=v=>'#'+['r','g','b'].map(k=>Math.round(v[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase()+(v.a<.999?Math.round(v.a*255).toString(16).padStart(2,'0').toUpperCase():'');
test('five new Living Environments have ten modes with matching semantic roles',()=>{
 const doc=validateEnvironmentManifest(manifest);
 assert.deepEqual(doc.environments.map(x=>x.name),['Forest','Desert','Aurora','Glacier','Embers']);
 for(const x of doc.environments)for(const mode of ['Dawn','Dusk'])assert.equal(Object.keys(x.modes[mode]).length,39);
});
test('Forest and Desert inherit original Grass/Paper colours exactly',()=>{
 for(const [name,modes] of [['Forest',['Dawn','Dusk']],['Desert',['PaperDawn','PaperDusk']]]){
  const env=manifest.environments.find(x=>x.name===name);
  for(const [index,mode]of ['Dawn','Dusk'].entries())for(const [role,token]of Object.entries(legacy.modes[modes[index]])){
    if(role.startsWith('color/')&&token.type==='COLOR')assert.equal(env.modes[mode][role],hex(token.value),name+'/'+mode+'/'+role);
  }
 }
});
test('opaque text and action colour pairs meet baseline WCAG AA contrast checks',()=>{
 for(const e of manifest.environments)for(const mode of ['Dawn','Dusk']){
  const p=e.modes[mode];
  for(const role of ['primary','secondary','muted'])
   assert.ok(contrastRatio(p['color/text/'+role],p['color/bg/surface'])>=4.5,e.name+'/'+mode+'/'+role);
  assert.ok(contrastRatio(p['color/action/on-primary'],p['color/action/primary'])>=4.5,e.name+'/'+mode+'/action');
  assert.ok(contrastRatio(p['color/focus/ring'],p['color/bg/surface'])>=3,e.name+'/'+mode+'/focus');
 }
});
test('environment CSS is a deterministic generated artifact',async()=>{
 const css=await readFile(new URL('../styles/living-environments.css',import.meta.url),'utf8');
 assert.equal(css,environmentCss(manifest));
 assert.equal((css.match(/data-meridian-environment="/g)||[]).length,10);
});
