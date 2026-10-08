import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('LM-02 decorative blobs truly join and separate while accessible radios own state',async({page})=>{
  await page.goto('lab/living-controls/');
  const separate=page.getByRole('radio',{name:'Separated'});
  const merge=page.getByRole('radio',{name:'Merged'});
  const left=page.locator('.lm-fusion-drop-left');
  const right=page.locator('.lm-fusion-drop-right');
  const overlap=async()=>{
    const a=await left.boundingBox(),b=await right.boundingBox();
    return Boolean(a&&b&&a.x+a.width>b.x+1);
  };
  await expect(separate).toBeChecked();
  await expect.poll(overlap).toBe(false);
  await merge.check();
  await expect(merge).toBeChecked();
  await expect(page.locator('#experiment-status')).toContainText('visual masses joined');
  await expect.poll(overlap,{timeout:4000}).toBe(true);
  await separate.check();
  await expect.poll(overlap,{timeout:4000}).toBe(false);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(audit.violations,JSON.stringify(audit.violations.map(a=>a.id))).toEqual([]);
});

test('LM-02 motion preferences disable transition, not native fusion selection',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('lab/living-controls/');
  await page.getByRole('radio',{name:'Merged'}).check();
  await expect(page.getByRole('radio',{name:'Merged'})).toBeChecked();
  await expect(page.locator('.lm-fusion-drop-left')).toHaveCSS('transition-duration','0s');
});

test('LM-04 attraction moves a decorative mass and preserves native destination choices',async({page})=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto('lab/living-workspace/');
  const track=page.locator('#gravity-track');
  const mass=page.locator('#gravity-mass');
  await page.getByRole('radio',{name:'East'}).check();
  await expect(track).toHaveAttribute('data-target-anchor','east');
  await expect(track).toHaveAttribute('data-physics-state','settled',{timeout:6000});
  const east=await mass.evaluate(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
  expect(east).toBeGreaterThan(0);
  await page.getByRole('radio',{name:'West'}).check();
  await expect(track).toHaveAttribute('data-physics-state','settled',{timeout:6000});
  const west=await mass.evaluate(node=>new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
  expect(west).toBeLessThan(0);
  await page.getByRole('radio',{name:'Center'}).check();
  await expect(page.getByRole('radio',{name:'Center'})).toBeChecked();
  await expect(page.locator('#gravity-status')).toContainText('Center anchor selected');
  expect(errors).toEqual([]);
});

test('LM-04 reduced motion snaps to the chosen anchor and keeps keyboard controls',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  await page.goto('lab/living-workspace/');
  const track=page.locator('#gravity-track');
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
  await page.getByRole('radio',{name:'East'}).check();
  await expect(track).toHaveAttribute('data-physics-state','settled');
  await page.getByRole('radio',{name:'East'}).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio',{name:'Center'})).toBeChecked();
  await expect(track).toHaveAttribute('data-target-anchor','center');
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(audit.violations,JSON.stringify(audit.violations.map(a=>a.id))).toEqual([]);
});
