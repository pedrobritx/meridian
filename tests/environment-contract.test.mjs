import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateEnvironmentManifest,environmentCss,contrastRatio,environmentContrastPairs,ENVIRONMENT_NAMES} from '../src/universal/environment-tokens.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const manifest=await read('../design/meridian/living-environments.json');
const compatibility=await read('../design/meridian/compatibility/environments-2026-11-02.json');
const legacy=await read('../design/figma/generated/tokens.json');
const hex=v=>'#'+['r','g','b'].map(k=>Math.round(v[k]*255).toString(16).padStart(2,'0')).join('').toUpperCase()+(v.a<.999?Math.round(v.a*255).toString(16).padStart(2,'0').toUpperCase():'');
test('ten current Living Environments have independent Dawn/Dusk palettes with matching semantic roles',()=>{
 const doc=validateEnvironmentManifest(manifest);
 assert.deepEqual(doc.environments.map(x=>x.name),['Forest','Core','Desert','Ocean','Alpine','Storm','Celestial','Aurora','Glacier','Embers']);
 for(const x of doc.environments)for(const mode of ['Dawn','Dusk'])assert.equal(Object.keys(x.modes[mode]).length,39);
});
test('current native collections and legacy compatibility have distinct provenance',()=>{
 assert.equal(manifest.designReference.environment.collectionId,'VariableCollectionId:302:34');
 assert.equal(manifest.designReference.environment.collectionName,'Meridian / Environment');
 assert.deepEqual(manifest.designReference.environment.modes,manifest.environments.map(x=>x.name));
 assert.equal(manifest.designReference.appearance.collectionId,'VariableCollectionId:302:35');
 assert.deepEqual(manifest.designReference.appearance.modes,['Dawn','Dusk']);
 assert.deepEqual(manifest.designReference.appearance.modeIds,{Dawn:'302:10',Dusk:'302:11'});
 for(const role of manifest.decorativeRoles)
  assert.equal(manifest.designReference.appearance.ambientRoleAliases[role],'{environment}/'+role);
 assert.equal(manifest.designReference.legacyEnvironment.collectionId,'VariableCollectionId:266:34');
 assert.equal(manifest.designReference.legacyEnvironment.status,'legacy-combined-modes');
});
test('native palette additions retain translucent material and shadow alpha',()=>{
 for(const id of ['core','ocean','alpine','storm','celestial']){
  const env=manifest.environments.find(x=>x.id===id);
  assert.equal(env.source.collectionId,'VariableCollectionId:302:35');
  assert.equal(env.source.variablePrefix,id+'/');
  for(const mode of ['Dawn','Dusk']){
   const p=env.modes[mode];
   for(const role of ['color/button/glass','color/button/glass-hover'])assert.match(p[role],/^#[0-9A-F]{6}F5$/);
   assert.equal(p['color/elevation/shadow'].slice(-2),mode==='Dawn'?'24':'52');
   assert.equal(p['color/material/glass'].slice(-2),mode==='Dawn'?'B8':'D1');
  }
 }
});
test('Forest and Desert inherit original Grass/Paper colours exactly',()=>{
test('six Living Environments have twelve modes with matching semantic roles',()=>{
 const doc=validateEnvironmentManifest(manifest);
 assert.deepEqual(doc.environments.map(x=>x.name),['Prism', 'Forest', 'Desert', 'Ocean', 'Aurora', 'Canyon']);
 assert.deepEqual(doc.environments.map(x=>x.name),[...ENVIRONMENT_NAMES]);
 for(const x of doc.environments)for(const mode of ['Dawn','Dusk'])assert.equal(Object.keys(x.modes[mode]).length,39);
});
test('Forest and archived Desert preserve original Grass/Paper colours',()=>{
 for(const [name,modes] of [['Forest',['Dawn','Dusk']],['Desert',['PaperDawn','PaperDusk']]]){
  const env=(name==='Desert'?compatibility:manifest).environments.find(x=>x.name===name);
  for(const [index,mode]of ['Dawn','Dusk'].entries())for(const [role,token]of Object.entries(legacy.modes[modes[index]])){
    if(role.startsWith('color/')&&token.type==='COLOR')assert.equal(env.modes[mode][role],hex(token.value),name+'/'+mode+'/'+role);
  }
 }
});
test('Prism environment keeps Core 0.5 colour roles apart from the documented glass alpha',()=>{
 const env=manifest.environments.find(x=>x.name==='Prism');
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
test('Aurora actions and atmosphere share a cool palette beyond the glass showcase',()=>{
 const aurora=manifest.environments.find(x=>x.id==='aurora');
 for(const mode of ['Dawn','Dusk']){
  const p=aurora.modes[mode];
  for(const role of ['color/action/primary','color/action/secondary','color/action/hover',
   'color/action/active','color/focus/ring','color/link/default','color/link/hover',
   'ambient/highlight','ambient/glow','ambient/earth']){
   const [r,g,b]=[1,3,5].map(i=>parseInt(p[role].slice(i,i+2),16));
   assert.ok(b>g&&b>r,'Aurora/'+mode+'/'+role+' must remain lavender or indigo, never mint');
  }
  assert.ok(contrastRatio(p['color/text/primary'],p['color/bg/sunken'])>=4.5,
   'Aurora/'+mode+' selection label must remain readable');
 }
});
test('every environment exposes selection roles from its semantic surface and text palette',()=>{
 const css=environmentCss(manifest);
 assert.equal((css.match(/--md-color-selection-background: var\(--md-color-bg-sunken\);/g)||[]).length,20);
 assert.equal((css.match(/--md-color-selection-foreground: var\(--md-color-text-primary\);/g)||[]).length,20);
 for(const env of manifest.environments)for(const mode of ['Dawn','Dusk']){
  const p=env.modes[mode];
  assert.ok(contrastRatio(p['color/text/primary'],p['color/bg/sunken'])>=4.5,
   env.name+'/'+mode+' selection label contrast');
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
 assert.equal(css,environmentCss(manifest,compatibility));
 assert.equal((css.match(/^\[data-meridian\]\[data-meridian-environment="[a-z]+"\][^\n]*\{$/gm)||[]).length,24,'one rule block per environment mode');
});
