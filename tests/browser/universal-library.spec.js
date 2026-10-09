import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Universal Lab publishes all 92 components and 80 symbols with working search',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('lab/universal-library/');
 await expect(page.getByRole('heading',{name:'A little more alive.'})).toBeVisible();
 await expect(page.locator('#total-count')).toHaveText('92 component contracts');
 await expect(page.locator('.u-component')).toHaveCount(92);
 await expect(page.locator('.u-symbol-cell')).toHaveCount(80);
 await page.locator('#component-search').fill('carousel');
 await expect(page.locator('.u-component')).toHaveCount(1);
 await expect(page.getByRole('heading',{name:'Carousel',exact:true})).toBeVisible();
 await page.locator('#component-search').fill('');
 await page.locator('#symbol-filter').fill('arrow');
 await expect(page.locator('.u-symbol-cell')).toHaveCount(2);
 expect(errors).toEqual([]);
});

test('Living Environments preview switches all ten token modes without replacing original theme roles',async({page})=>{
 await page.goto('lab/universal-library/');
 await expect(page.locator('.u-theme')).toHaveCount(5);
 const selector=page.locator('#appearance-mode');
 await expect(selector.locator('option')).toHaveCount(10);
 await selector.selectOption('aurora:dark');
 await expect(page.locator('html')).toHaveAttribute('data-meridian-environment','aurora');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 const surface=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--md-color-bg-surface').trim());
 expect(surface).toBe('rgb(27 33 64 / 1)');
 await selector.selectOption('desert:light');
 await expect(page.locator('html')).toHaveAttribute('data-meridian-environment','desert');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('Universal Lab representative surface passes automated accessibility audit',async({page})=>{
 await page.goto('lab/universal-library/');
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(axe.violations,JSON.stringify(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})))).toEqual([]);
});
