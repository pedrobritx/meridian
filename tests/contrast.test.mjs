import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const t=JSON.parse(readFileSync(new URL('../tokens/meridian.json',import.meta.url)));
function luminance(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [i,mode] of ['Dawn','Dusk'].entries()){
 const resolve=name=>t.primitives[t.colors[name][i]];
 test(`${mode}: text, actions and statuses retain AA contrast on all solid surfaces`,()=>{
  for(const role of ['text/primary','text/secondary','text/muted','action/primary','action/secondary','status/success','status/warning','status/error','status/info'])for(const bg of ['bg/page','bg/sunken','bg/surface','bg/overlay']){
   const measured=ratio(resolve(role),resolve(bg));assert.ok(measured>=4.5,`${role} on ${bg}: ${measured.toFixed(2)}`);
  }
  for(const [fg,bg] of [['action/on-primary','action/primary'],['action/on-primary','action/hover'],['action/on-destructive','action/destructive']])assert.ok(ratio(resolve(fg),resolve(bg))>=4.5,`${fg} on ${bg}`);
 });
 test(`${mode}: control boundaries and focus are distinguishable`,()=>{for(const bg of ['bg/page','bg/sunken','bg/surface','bg/overlay'])for(const fg of ['border/control','focus/ring'])assert.ok(ratio(resolve(fg),resolve(bg))>=3,`${fg} on ${bg}`);});
}
test('Both environments resolve every semantic colour',()=>{for(const [role,pair] of Object.entries(t.colors)){assert.equal(pair.length,2,role);for(const name of pair)assert.match(t.primitives[name]??'',/^#[\da-f]{6}$/i,`${role} alias ${name}`);}});
