import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initLiquidGlass} from '../src/universal/liquid-glass.js';

// EventTarget exercises subscriptions and browser preferences without replacing
// native control behavior, which is covered separately in the browser fixtures.
function emptyDocument() {
  const attrs=new Map(),frames=new Map(),queries=new Map();
  let frameId=0;
  const element={
    nodeType:1,getAttribute:name=>attrs.get(name)??null,
    setAttribute:(name,value)=>attrs.set(name,value),removeAttribute:name=>attrs.delete(name),
    closest:()=>null
  };
  const view=new EventTarget();
  view.visualViewport=new EventTarget();
  view.matchMedia=query=>{
    if (!queries.has(query)) {const media=new EventTarget();media.matches=false;queries.set(query,media);}
    return queries.get(query);
  };
  view.requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;};
  view.cancelAnimationFrame=id=>frames.delete(id);
  view.MutationObserver=class {observe(){}disconnect(){}};
  const doc=new EventTarget();
  Object.assign(doc,{nodeType:9,defaultView:view,documentElement:element,activeElement:null,querySelectorAll:()=>[],contains:el=>el===element});
  return {doc,attrs,frames,viewport:view.visualViewport,change(query,value){
    const media=queries.get(query);assert.ok(media,`Preference ${query} was subscribed`);
    media.matches=value;media.dispatchEvent(new Event('change'));
  },flush(){for (const [id,callback] of [...frames]) {frames.delete(id);callback();}}};
}

test('Liquid Glass follows changing system preferences and schedules no idle animation',()=>{
  const env=emptyDocument(),glass=initLiquidGlass(env.doc);
  assert.equal(env.attrs.get('data-glass-motion'),'fluid');
  assert.equal(env.attrs.get('data-glass-transparency'),'translucent');
  assert.equal(env.frames.size,0,'Initialization leaves no idle animation loop');
  env.change('(prefers-reduced-motion: reduce)',true);
  env.viewport.dispatchEvent(new Event('resize'));
  env.change('(prefers-reduced-transparency: reduce)',true);
  assert.equal(env.frames.size,1,'Multiple preference updates share one pending frame');
  env.flush();
  assert.equal(env.attrs.get('data-glass-motion'),'quiet');
  assert.equal(env.attrs.get('data-glass-transparency'),'opaque');
  assert.equal(env.frames.size,0,'An update does not schedule its own next frame');
  env.change('(prefers-reduced-motion: reduce)',false);
  env.change('(prefers-reduced-transparency: reduce)',false);
  env.change('(forced-colors: active)',true);
  env.flush();
  assert.equal(env.attrs.get('data-glass-motion'),'quiet');
  assert.equal(env.attrs.get('data-glass-transparency'),'opaque');
  env.change('(forced-colors: active)',false);env.flush();
  assert.equal(env.attrs.get('data-glass-motion'),'fluid');
  assert.equal(env.attrs.get('data-glass-transparency'),'translucent');
  glass.destroy();
});

test('teardown cancels work, restores authored state, unsubscribes, and allows a fresh mount',()=>{
  const env=emptyDocument();env.attrs.set('data-glass-motion','authored');
  const glass=initLiquidGlass(env.doc);
  assert.equal(initLiquidGlass(env.doc),glass,'Repeated initialization shares one controller');
  env.change('(prefers-reduced-motion: reduce)',true);
  assert.equal(env.frames.size,1);
  glass.destroy();glass.destroy();
  assert.equal(env.frames.size,0);
  assert.equal(env.attrs.get('data-glass-motion'),'authored');
  assert.equal(env.attrs.has('data-glass-transparency'),false);
  env.change('(prefers-reduced-motion: reduce)',false);
  env.doc.dispatchEvent(new Event('scroll'));
  env.viewport.dispatchEvent(new Event('resize'));
  env.viewport.dispatchEvent(new Event('scroll'));
  assert.equal(env.frames.size,0,'Destroyed subscriptions cannot schedule work');
  const remounted=initLiquidGlass(env.doc,{motion:false,transparency:false});
  assert.notEqual(remounted,glass);
  assert.equal(env.attrs.get('data-glass-motion'),'quiet');
  assert.equal(env.attrs.get('data-glass-transparency'),'opaque');
  remounted.destroy();
});

test('server-side use is a harmless optional enhancement',()=>{
  const glass=initLiquidGlass(null);
  assert.doesNotThrow(()=>{glass.refresh();glass.destroy();});
});
