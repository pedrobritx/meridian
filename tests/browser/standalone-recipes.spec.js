import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

// Consumers may use these recipes without the reference site's global reset.
const tokens = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8');
const components = readFileSync(new URL('../../styles/components.css', import.meta.url), 'utf8');

test('standalone fields fit their container and dark native controls follow explicit appearance', async ({page}) => {
  await page.setContent(`<div data-meridian="core" class="dark" style="width:200px">
    <input class="md-input" aria-label="Name">
    <select class="md-select" aria-label="Choice"><option>One</option></select>
    <textarea class="md-textarea" aria-label="Notes"></textarea>
  </div>`);
  await page.addStyleTag({content: tokens + '\n' + components});
  const boundary = page.locator('[data-meridian]');
  expect(await boundary.evaluate(el => getComputedStyle(el).colorScheme)).toBe('dark');
  for (const field of await page.locator('input,select,textarea').all()) {
    expect(await field.evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(200);
  }
  await boundary.evaluate(el => el.dataset.theme = 'light');
  expect(await boundary.evaluate(el => getComputedStyle(el).colorScheme)).toBe('light');
});
