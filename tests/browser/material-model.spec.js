import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const contexts=['desk','touch','wrist','space','drive'];

for (const env of ['prism','forest','desert','ocean','aurora','canyon']) {
 for (const appearance of ['dawn','dusk']) {
  test(`${env}/${appearance}: every context renders without errors or WCAG A/AA violations`, async ({page}) => {
   test.setTimeout(90000);
   const errors = []; page.on('pageerror', e => errors.push(e.message));
   await page.goto('lab/material-model/');
   await expect(page.getByRole('heading', {name:'Meridian Material Lab'})).toBeVisible();
   await page.locator(`input[name=env][value=${env}]`).check({force:true});
   await page.locator(`input[name=appearance][value=${appearance}]`).check({force:true});
   for (const context of contexts) {
    await page.locator(`input[name=context][value=${context}]`).check({force:true});
    await expect(page.locator('html')).toHaveAttribute('data-context', context);
    await expect(page.locator('html')).toHaveAttribute('data-env', env);
    const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(v => v.id), `${env}/${appearance}/${context}`).toEqual([]);
   }
   expect(errors).toEqual([]);
  });
 }
}

test('the settings sheet takes focus and returns it on Escape',async({page})=>{
 await page.goto('lab/material-model/');
 await page.locator('input[name=context][value=touch]').check({force:true});
 await page.getByRole('button',{name:'Reading settings'}).click();
 await expect(page.getByRole('dialog',{name:'Reading settings'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Close'})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'Reading settings'})).toBeHidden();
 await expect(page.getByRole('button',{name:'Reading settings'})).toBeFocused();
});

test('a moving vehicle locks reading, removes texture and drops to Solid without motion',async({page})=>{
 await page.goto('lab/material-model/');
 await page.locator('input[name=context][value=drive]').check({force:true});
 await page.locator('#driving').check({force:true});
 await expect(page.locator('html')).toHaveAttribute('data-driving','true');
 await expect(page.locator('html')).toHaveAttribute('data-tier','solid');
 await expect(page.locator('html')).toHaveAttribute('data-motion','reduced');
 await expect(page.locator('input[name=drive-mode][value=read]')).toBeDisabled();
 await expect(page.getByText('Reading is paused while the vehicle is moving.')).toBeVisible();
});

// The preview container survives context changes; its actions must bind only once.
test('preview actions fire once after switching contexts', async ({page}) => {
 await page.goto('lab/material-model/');
 for (const context of ['touch', 'wrist', 'touch'])
  await page.locator(`input[name=context][value=${context}]`).check({force:true});
 const bookmark = page.getByRole('button', {name:'Bookmark', exact:true});
 await bookmark.click();
 await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
 await bookmark.click();
 await expect(bookmark).toHaveAttribute('aria-pressed', 'false');
});
