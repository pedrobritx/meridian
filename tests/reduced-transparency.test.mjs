import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

// ADR-0002 §5: a glass surface is stable only with a reduced-transparency fallback. In the stable
// library CSS (styles/), every rule that blurs its backdrop needs a matching rule inside
// @media (prefers-reduced-transparency: reduce) that removes the blur.
function rules(css){
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');
  const out=[],stack=[];let start=0;
  for(let i=0;i<css.length;i++){
    if(css[i]==='{'){stack.push(css.slice(start,i).trim());start=i+1;}
    else if(css[i]==='}'){
      const prelude=stack.pop();const body=css.slice(start,i);start=i+1;
      if(prelude&&!prelude.startsWith('@'))out.push({selectors:prelude.split(',').map(s=>s.trim()),body,context:[...stack]});
    }
  }
  return out;
}
const reduced=r=>r.context.some(c=>/^@media[^{]*prefers-reduced-transparency\s*:\s*reduce/.test(c.replace(/\s+/g,' ')));
const blurs=r=>/backdrop-filter\s*:\s*(?!none)[^;]+/.test(r.body);
const clears=r=>/backdrop-filter\s*:\s*none/.test(r.body);

test('every backdrop blur in the stable library has a reduced-transparency fallback',async()=>{
  const dir=new URL('../styles/',import.meta.url);
  const all=[];
  for(const file of (await readdir(dir)).filter(f=>f.endsWith('.css')))all.push(...rules(await readFile(new URL(file,dir),'utf8')).map(r=>({...r,file})));
  const glass=all.filter(r=>blurs(r)&&!reduced(r));
  assert.ok(glass.length>0,'expected glass rules in styles/');
  const fallbacks=all.filter(r=>reduced(r)&&clears(r)).flatMap(r=>r.selectors);
  for(const rule of glass)for(const selector of rule.selectors){
    const base=selector.split(':')[0];
    assert.ok(fallbacks.some(f=>f===selector||f.startsWith(base)),`${rule.file}: ${selector} blurs its backdrop without a reduced-transparency fallback`);
  }
});
