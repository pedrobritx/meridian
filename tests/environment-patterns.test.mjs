import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {environmentCss} from '../src/universal/environment-tokens.mjs';
import {ENVIRONMENTS,resolveAppearance,resolveContext,validateIdentity,environmentPalette} from '../lab/environment-patterns/resolve.mjs';
import {identities} from '../lab/environment-patterns/identities.mjs';
const read=async path=>readFile(new URL(path,import.meta.url),'utf8');
const manifest=JSON.parse(await read('../design/meridian/living-environments.json'));

test('System is a policy that resolves to Dawn or Dusk, never a mode',()=>{
 assert.equal(resolveAppearance('system',false),'Dawn');
 assert.equal(resolveAppearance('system',true),'Dusk');
 assert.equal(resolveAppearance('dawn',true),'Dawn');
 assert.equal(resolveAppearance('dusk',false),'Dusk');
 assert.throws(()=>resolveAppearance('midnight',false));
});

test('Environment, appearance, identity, material and motion resolve independently',()=>{
 const base={environment:'forest',appearance:'dawn',material:'opaque',motion:'system'};
 const a=resolveContext(base,{manifest,identities});
 const b=resolveContext({...base,environment:'ocean'},{manifest,identities});
 assert.equal(b.attributes['data-theme'],a.attributes['data-theme']);
 assert.equal(b.attributes['data-material'],a.attributes['data-material']);
 assert.equal(b.attributes['data-meridian'],a.attributes['data-meridian']);
 const c=resolveContext({...base,identity:'lexis'},{manifest,identities});
 assert.equal(c.attributes['data-meridian-environment'],'forest');
 assert.equal(c.attributes['data-meridian'],'paper');
 assert.equal(c.style['--md-color-action-primary'],identities.lexis.Dawn.primary);
 const d=resolveContext({...base,appearance:'dusk',identity:'lexis'},{manifest,identities});
 assert.equal(d.style['--md-color-action-primary'],identities.lexis.Dusk.primary,'identity follows appearance with its own Dusk pair');
});

test('product identity pairs pass in all twelve environment modes',()=>{
 for(const id of Object.values(identities))for(const env of ENVIRONMENTS)for(const appearance of ['Dawn','Dusk']){
  const result=validateIdentity(id[appearance],environmentPalette(manifest,env,appearance));
  assert.ok(result.ok,`${id.name} ${env} ${appearance}: ${JSON.stringify(result.failures)}`);
 }
});

test('an inaccessible brand override is rejected and the environment action is kept',()=>{
 const weak={name:'Weak',profile:'grass',Dawn:{primary:'#9FD8C4',onPrimary:'#FFFFFF'},Dusk:{primary:'#1A3038',onPrimary:'#101F26'}};
 const r=resolveContext({environment:'forest',appearance:'dawn',identity:'weak'},{manifest,identities:{weak}});
 assert.equal(r.style['--md-color-action-primary'],undefined);
 assert.equal(r.warnings.length,1);
});

test('system accessibility requests override chosen material and motion',()=>{
 const request={environment:'aurora',appearance:'dusk',material:'glass',motion:'expressive'};
 const free=resolveContext(request,{manifest});
 assert.equal(free.attributes['data-material'],'glass');
 for(const flag of ['reducedTransparency','increasedContrast','forcedColors'])
  assert.equal(resolveContext(request,{manifest,system:{[flag]:true}}).attributes['data-material'],'opaque',flag);
 assert.equal(resolveContext(request,{manifest,system:{reducedMotion:true}}).attributes['data-motion'],'reduced');
});

test('ambient intensity is decorative and clamped to 0..1',()=>{
 assert.equal(resolveContext({ambientIntensity:3},{manifest}).style['--md-ambient-intensity'],'1');
 assert.equal(resolveContext({ambientIntensity:-1},{manifest}).style['--md-ambient-intensity'],'0');
});

test('environment Dusk honours the stable 0.5 .dark boundary class',()=>{
 const css=environmentCss(manifest);
 for(const id of ENVIRONMENTS)
  assert.ok(css.includes(`[data-meridian][data-meridian-environment="${id}"].dark:not([data-theme="light"])`),id);
});

test('Lab material and page styles use semantic and ambient roles only, never raw colours',async()=>{
 for(const path of ['../lab/environment-patterns/material.css','../lab/environment-patterns/patterns.css','../styles/components.css']){
  const css=(await read(path)).replace(/url\("data:[^"]+"\)/g,'');
  assert.deepEqual(css.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi)??[],[],path);
 }
});

test('stable 0.5 tokens are untouched by the Lab',async()=>{
 const tokens=await read('../styles/tokens.css');
 assert.ok(!tokens.includes('data-meridian-environment'));
 assert.ok(!tokens.includes('data-material'));
});
