import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Living Workspace panel opens, switches views and restores focus',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('lab/living-workspace/');
 await expect(page.getByRole('heading',{name:'Living Workspace.'})).toBeVisible();
 const open=page.getByRole('button',{name:'Open panel'});
 await open.click();await expect(page.getByRole('complementary',{name:'Floating workspace panel'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Close panel'})).toBeFocused();
 const material=page.getByRole('tab',{name:'Material'});await material.focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:'Motion'})).toHaveAttribute('aria-selected','true');
 await expect(page.getByRole('tabpanel',{name:'Motion'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(open).toBeFocused();
 await expect(open).toHaveAttribute('aria-expanded','false');
 expect(errors).toEqual([]);
});
test('Living Workspace width changes and resets with native input',async({page})=>{
 await page.goto('lab/living-workspace/');
 const input=page.getByRole('slider',{name:/Surface width/});
 await input.fill('85');await expect(page.locator('#surface-value')).toHaveText('85%');
 await expect(page.locator('#surface')).toHaveCSS('width',/\d+px/);
 await page.getByRole('button',{name:'Reset experiment'}).click();
 await expect(page.locator('#surface-value')).toHaveText('60%');
});
test('Living Workspace accessible fallback and layout',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
 await page.goto('lab/living-workspace/');
 await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
 await expect(page.locator('html')).toHaveAttribute('data-lab-opaque','true');
 await page.getByRole('button',{name:'Open panel'}).click();
 await expect(page.getByRole('complementary',{name:'Floating workspace panel'})).toBeVisible();
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations,audit.violations.map(x=>x.id).join(',')).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
