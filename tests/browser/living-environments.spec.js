import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('environment, appearance and product identity are independent',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('lab/living-environments/');
 await expect(page.getByRole('heading',{name:'Living Environments.'})).toBeVisible();
 const environment=page.getByLabel('Natural environment');
 const appearance=page.getByLabel('Appearance');
 const identity=page.getByLabel('Product identity');
 await appearance.selectOption('dark');
 for(const value of ['forest','ocean','desert','alpine','storm','celestial']){
   await environment.selectOption(value);
   await expect(page.locator('html')).toHaveAttribute('data-environment',value);
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await expect(page.locator('[data-environment-choice='+value+']')).toHaveAttribute('aria-pressed','true');
   await expect(page.getByRole('heading',{name:'Find your next direction.'})).toBeVisible();
 }
 await identity.selectOption('wine');
 await expect(page.locator('html')).toHaveAttribute('data-identity','wine');
 await environment.selectOption('forest');
 await expect(page.locator('html')).toHaveAttribute('data-identity','wine');
 await expect(page.locator('html')).toHaveAttribute('data-environment','forest');
 await expect(page.locator('#contrast-metrics')).toContainText('action label');
 expect(errors).toEqual([]);
});

test('semantic choice and feedback remain functional across themes and devices',async({page})=>{
 await page.goto('lab/living-environments/');
 await page.getByRole('radio',{name:'Reflect'}).check();
 await page.getByRole('button',{name:'Confirm selection'}).click();
 await expect(page.locator('#task-status')).toContainText('Reflect');
 await page.getByRole('button',{name:'Reset choice'}).click();
 await expect(page.getByRole('radio',{name:'Discover'})).toBeChecked();
 await page.getByRole('button',{name:'Choose Ocean environment'}).click();
 await expect(page.getByLabel('Natural environment')).toHaveValue('ocean');
 await expect(page.getByRole('radio',{name:'Discover'})).toBeChecked();
 await page.getByRole('radio',{name:'Create'}).focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('radio',{name:'Reflect'})).toBeChecked();
 await page.evaluate(()=>document.fonts.ready);
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations,JSON.stringify(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('glass falls back to opaque for accessibility preferences',async({page})=>{
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce',forcedColors:'active'});
 await page.goto('lab/living-environments/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('checkbox',{name:/Glass surface/}).check();
 await expect(page.locator('html')).toHaveAttribute('data-material','opaque');
 await expect(page.locator('#preference-status')).toContainText('Glass replaced with an opaque surface');
 await page.getByRole('radio',{name:'Create'}).check();
 await page.getByRole('button',{name:'Confirm selection'}).click();
 await expect(page.locator('#task-status')).toContainText('Create');
 await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 await expect(page.locator('html')).toHaveAttribute('data-material','glass');
});

test('Dawn and Dusk are independent from environment and system appearance',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});
 await page.goto('lab/living-environments/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByLabel('Appearance').selectOption('light');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Natural environment').selectOption('storm');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Appearance').selectOption('system');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({colorScheme:'light'});
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
