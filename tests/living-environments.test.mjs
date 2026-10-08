import {test} from 'node:test';
import assert from 'node:assert/strict';
import {environments,identities,contrastRatio} from '../lab/living-environments/environments.js';

test('every experimental environment provides both appearances and a complete semantic role set',()=>{
  assert.deepEqual(Object.keys(environments),['forest','ocean','desert','alpine','storm','celestial']);
  for(const [name,profile] of Object.entries(environments)){
    assert.ok(profile.name&&profile.note,name+' metadata');
    for(const mode of ['light','dark']){
      const p=profile[mode];
      for(const role of ['page','surface','text','muted','border','action','onAction','sun','mid','deep','atmosphere'])
        assert.match(p[role],/^#[0-9A-Fa-f]{6}$/,name+'/'+mode+'/'+role);
    }
  }
});
test('opaque essential text, muted copy and button labels meet WCAG AA contrast',()=>{
  for(const [name,profile] of Object.entries(environments)){
    for(const mode of ['light','dark']){
      const p=profile[mode];
      for(const [label,a,b] of [
        ['essential text',p.text,p.surface],
        ['muted secondary copy',p.muted,p.surface],
        ['action label',p.onAction,p.action]
      ]){
        assert.ok(contrastRatio(a,b)>=4.5, name+'/'+mode+'/'+label+' insufficient contrast: '+contrastRatio(a,b).toFixed(2));
      }
      for(const [identity,brand] of Object.entries(identities)){
        if(brand.accent)assert.ok(contrastRatio(p.onAction,brand.accent)>=4.5,name+'/'+mode+'/'+identity+' brand action contrast insufficient');
      }
    }
  }
});
test('contrast implementation follows standard black/white sanity checks',()=>{
  assert.ok(Math.abs(contrastRatio('#000000','#FFFFFF')-21)<.001);
  assert.equal(contrastRatio('#FFFFFF','#FFFFFF'),1);
});
