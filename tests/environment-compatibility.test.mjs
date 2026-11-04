import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {environmentCss} from '../src/universal/environment-tokens.mjs';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
const active=await read('../design/meridian/living-environments.json');
const old=await read('../design/meridian/compatibility/environments-2026-11-02.json');
test('retired selectors retain their exact original declarations but never enter the six-family catalog',()=>{
 const css=environmentCss(active,old);
 for(const id of ['core','alpine','storm','celestial','glacier','embers']){
  assert.ok(!active.environments.some(e=>e.id===id));
  const e=old.environments.find(e=>e.id===id);
  for(const [mode,roles] of Object.entries(e.modes)){
   const suffix=mode==='Dawn'?':not([data-theme="dark"])':'[data-theme="dark"]';
   const rule=css.slice(css.indexOf(`[data-meridian][data-meridian-environment="${id}"]${suffix}`)).split('}')[0];
   for(const value of Object.values(roles)){
    const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
    const alpha=value.length===9?(parseInt(value.slice(7,9),16)/255).toFixed(4):'1';
    assert.ok(rule.includes(`rgb(${rgb.join(' ')} / ${alpha})`),id+'/'+mode+'/'+value);
   }
  }
 }
});
