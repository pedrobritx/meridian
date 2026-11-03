import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateEnvironmentManifest,environmentCss,contrastRatio,environmentContrastPairs,ENVIRONMENT_NAMES} from '../src/universal/environment-tokens.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const manifest=await read('../design/meridian/living-environments.json');
const legacy=await read('../design/figma/generated/tokens.json');
const hex=v=>'#'+['r','g','b'].map(k=>Math.round(v[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase()+(v.a<.999?Math.round(v.a*255).toString(16).padStart(2,'0').toUpperCase():'');
test('ten Living Environments have twenty modes with matching semantic roles',()=>{
 const doc=validateEnvironmentManifest(manifest);
 assert.deepEqual(doc.environments.map(x=>x.name),['Forest','Core','Desert','Ocean','Alpine','Storm','Celestial','Aurora','Glacier','Embers']);
 assert.deepEqual(doc.environments.map(x=>x.name),[...ENVIRONMENT_NAMES]);
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
test('Core environment keeps Core 0.5 colour roles apart from the documented glass alpha',()=>{
 const env=manifest.environments.find(x=>x.name==='Core');
 for(const [index,mode]of ['CoreDawn','CoreDusk'].entries())for(const [role,token]of Object.entries(legacy.modes[mode])){
  if(!role.startsWith('color/')||token.type!=='COLOR'||role==='color/material/glass')continue;
  assert.equal(env.modes[['Dawn','Dusk'][index]][role],hex(token.value),'Core/'+mode+'/'+role);
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
// ADR-0002 §6: an environment is a candidate only if every automated pair passes; otherwise it is
// Preview and its failures are recorded exactly, so new failures and silent fixes both surface here.
test('full contrast pair set decides candidate or preview status',()=>{
 for(const e of manifest.environments){
  const failures=[];
  for(const mode of ['Dawn','Dusk'])for(const p of environmentContrastPairs(e.modes[mode]))
   if(!p.pass)failures.push(mode+': '+p.foreground+' on '+p.background);
  assert.deepEqual(e.knownContrastFailures,failures,e.name);
  assert.equal(e.status,failures.length?'preview':'candidate',e.name);
 }
});
test('environment CSS is a deterministic generated artifact',async()=>{
 const css=await readFile(new URL('../styles/living-environments.css',import.meta.url),'utf8');
 assert.equal(css,environmentCss(manifest));
 assert.equal((css.match(/data-meridian-environment="/g)||[]).length,20);
});
