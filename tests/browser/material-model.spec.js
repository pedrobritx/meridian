import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const contexts=['desk','touch','wrist','space','drive'];

async function checkControl(page, selector) {
 const input = page.locator(selector);
 // Exercise the visible native label; a forced click on a clipped 1px input
 // can hit a different swatch in Firefox and Linux WebKit.
 if (!await input.isChecked()) await input.locator('..').click();
 await expect(input).toBeChecked();
}

for (const env of ['prism','forest','desert','ocean','aurora','canyon']) {
 for (const appearance of ['dawn','dusk']) {
  test(`${env}/${appearance}: every context renders without errors or WCAG A/AA violations`, async ({page}) => {
   test.setTimeout(90000);
   const errors = []; page.on('pageerror', e => errors.push(e.message));
   await page.goto('lab/material-model/');
   await expect(page.getByRole('heading', {name:'Meridian Material Lab'})).toBeVisible();
   await checkControl(page, `input[name=env][value=${env}]`);
   await checkControl(page, `input[name=appearance][value=${appearance}]`);
   for (const context of contexts) {
    await checkControl(page, `input[name=context][value=${context}]`);
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
 await checkControl(page, 'input[name=context][value=touch]');
 await page.getByRole('button',{name:'Reading settings'}).click();
 await expect(page.getByRole('dialog',{name:'Reading settings'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Close'})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'Reading settings'})).toBeHidden();
 await expect(page.getByRole('button',{name:'Reading settings'})).toBeFocused();
});

test('a moving vehicle locks reading, removes texture and drops to Solid without motion',async({page})=>{
 await page.goto('lab/material-model/');
 await checkControl(page, 'input[name=context][value=drive]');
 await checkControl(page, '#driving');
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
  await checkControl(page, `input[name=context][value=${context}]`);
 const bookmark = page.getByRole('button', {name:'Bookmark', exact:true});
 await bookmark.click();
 await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
 await bookmark.click();
 await expect(bookmark).toHaveAttribute('aria-pressed', 'false');
});
