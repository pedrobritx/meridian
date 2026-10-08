import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Living Controls renders, functions and passes WCAG AA checks', async ({page}) => {
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('lab/living-controls/');
  await expect(page.getByRole('heading',{name:'Living Controls.'})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','expressive');
  await page.getByRole('button',{name:'Activate control'}).click();
  await expect(page.locator('#experiment-status')).toContainText('baseline action completed');
  await page.getByRole('button',{name:'Explore attraction'}).click();
  await expect(page.locator('#experiment-status')).toContainText('magnetic action completed');
  await page.getByRole('button',{name:'Feel the rebound'}).click();
  await expect(page.locator('#experiment-status')).toContainText('elastic action completed immediately');
  const fluid=page.getByRole('radio',{name:'Fluid'});
  await fluid.check();
  await expect(fluid).toBeChecked();
  await expect(page.locator('#experiment-status')).toContainText('Fluid selected');
  await page.evaluate(()=>document.fonts.ready);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations, JSON.stringify(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('disabling motion preserves every functional action', async ({page})=>{
  await page.goto('lab/living-controls/');
  const enabled=page.getByRole('checkbox',{name:'Expressive effects'});
  await enabled.uncheck();
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
  await page.getByRole('button',{name:'Explore attraction'}).click();
  await expect(page.locator('#experiment-status')).toContainText('magnetic action completed');
  await page.getByRole('button',{name:'Feel the rebound'}).click();
  await expect(page.locator('#experiment-status')).toContainText('elastic action completed');
  await page.getByRole('radio',{name:'Glass'}).check();
  await expect(page.getByRole('radio',{name:'Glass'})).toBeChecked();
  await enabled.check();
  await page.getByRole('slider',{name:/Intensity/}).fill('0');
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
});

test('OS reduced-motion preference overrides optional enhancement', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('lab/living-controls/');
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
  await expect(page.locator('#preference-note')).toContainText('Reduced motion');
  await page.getByRole('button',{name:'Feel the rebound'}).click();
  await expect(page.locator('#experiment-status')).toContainText('completed immediately');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','expressive');
});

test('radio group supports keyboard selection without motion', async ({page})=>{
  await page.goto('lab/living-controls/');
  const paper=page.getByRole('radio',{name:'Paper'});
  await paper.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio',{name:'Glass'})).toBeChecked();
  await expect(page.locator('#experiment-status')).toContainText('Glass selected');
});

test('native controls remain functional without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/meridian/lab/living-controls/');
  await expect(page.getByRole('button',{name:'Explore attraction'})).toBeVisible();
  await page.getByRole('button',{name:'Explore attraction'}).click();
  const glass=page.getByRole('radio',{name:'Glass'});
  await glass.check();
  await expect(glass).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-lab-motion','quiet');
  // Native control activation and radio state above are the definitive no-JS fallback contract.
  // Do not inspect noscript.textContent: browsers expose an empty textContent in this mode.
  await context.close();
});

test('local measurement stays descriptive and private', async ({page},testInfo) => {
  await page.goto('lab/living-controls/');
  const metric=page.locator('#lab-frame-metric');
  await expect(metric).toContainText('No pointer frames observed');
  if (testInfo.project.name === 'desktop') {
    const button=page.getByRole('button',{name:'Explore attraction'});
    await button.hover();
    const b=await button.boundingBox();
    await page.mouse.move(b.x+b.width*0.55,b.y+b.height*0.55);
    await expect(metric).toContainText('samples');
    await expect(metric).toContainText('mean scheduling delay');
  }
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});
