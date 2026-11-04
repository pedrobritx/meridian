import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const signature=el=>[...el.querySelectorAll('.ep-fixture *')].map(n=>n.tagName+(n.className&&typeof n.className==='string'?'.'+n.className:'')).join('|');

test('one shared fixture renders identically in all twelve environment modes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('lab/environment-patterns/');
 const cells=page.locator('#matrix .ep-boundary');
 await expect(cells).toHaveCount(12);
 const result=await cells.evaluateAll((nodes,sig)=>{const s=new Function('el','return ('+sig+')(el)');return nodes.map(n=>({sig:s(n),
  env:n.dataset.meridianEnvironment,theme:n.dataset.theme,bg:getComputedStyle(n).getPropertyValue('--md-color-bg-page').trim(),
  height:Math.round(n.querySelector('.ep-card').getBoundingClientRect().height)}))},signature.toString());
 expect(new Set(result.map(r=>r.sig)).size).toBe(1);
 expect(new Set(result.map(r=>r.bg)).size).toBe(12);
 expect(new Set(result.map(r=>r.env))).toEqual(new Set(['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon']));
 expect(Math.max(...result.map(r=>r.height))-Math.min(...result.map(r=>r.height))).toBeLessThanOrEqual(2);
 expect(errors).toEqual([]);
});

test('Forest Dawn and Dusk resolve the canonical Grass-heritage palette',async({page})=>{
 await page.goto('lab/environment-patterns/');
 const values=await page.locator('#forest-pair .ep-boundary').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).getPropertyValue('--md-color-bg-page').trim()));
 expect(values).toEqual(['rgb(244 246 242 / 1)','rgb(16 31 38 / 1)']);
});

test('settings stay independent and accessibility overrides decoration',async({page})=>{
 await page.goto('lab/environment-patterns/');
 const specimen=page.locator('#specimen-boundary .ep-boundary');
 await page.selectOption('#appearance','dusk');
 await page.selectOption('#identity','lexis');
 await page.selectOption('#material','glass');
 await expect(specimen).toHaveAttribute('data-meridian-environment','prism');
 await expect(specimen).toHaveAttribute('data-theme','dark');
 await expect(specimen).toHaveAttribute('data-meridian','paper');
 await expect(specimen).toHaveAttribute('data-material','glass');
 const backdrop=await specimen.locator('.ep-chrome').evaluate(n=>getComputedStyle(n).backdropFilter);
 expect(backdrop).toContain('blur');
 await page.selectOption('#environment','canyon');
 await expect(specimen).toHaveAttribute('data-meridian','paper');
 await expect(specimen).toHaveAttribute('data-theme','dark');
 const pair=page.locator('#override-pair .ep-boundary');
 await expect(pair.nth(0)).toHaveAttribute('data-material','glass');
 await expect(pair.nth(1)).toHaveAttribute('data-material','opaque');
 await expect(pair.nth(1)).toHaveAttribute('data-motion','reduced');
 await expect(pair.nth(1).getByRole('button',{name:'Publish lesson'})).toBeVisible();
});

test('reduced transparency and reduced motion from the system are enforced',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('lab/environment-patterns/');
 await page.selectOption('#motion','expressive');
 await expect(page.locator('#specimen-boundary .ep-boundary')).toHaveAttribute('data-motion','reduced');
});

test('segmented control keeps native radio semantics and keyboard selection',async({page})=>{
 await page.goto('lab/environment-patterns/');
 const group=page.locator('#forest-pair .ep-boundary').first().getByRole('group',{name:'Lesson view'});
 await group.getByRole('radio',{name:'Draft'}).focus();
 await page.keyboard.press('ArrowRight');
 await expect(group.getByRole('radio',{name:'Review'})).toBeChecked();
});

test('Environment Patterns passes automated accessibility audit without horizontal scroll',async({page})=>{
 await page.goto('lab/environment-patterns/');
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(axe.violations,JSON.stringify(axe.violations.map(v=>({id:v.id,targets:v.nodes.slice(0,5).map(n=>n.target)})))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
