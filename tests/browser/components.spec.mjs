// Browser checks for the components: accessibility in every environment, target sizes,
// keyboard use, the fluid's timing, reduced motion and the solid tier.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ENVS = ['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon'];
const ready = page => page.waitForFunction(() => document.querySelectorAll('.m-seg .m-ind').length > 0 && document.querySelectorAll('.m-body').length > 10);
const open = async (page, query = '') => { await page.goto(`/components/?${query}`); await ready(page); };

test.describe('accessibility', () => {
  for (const env of ENVS) for (const appearance of ['dawn', 'dusk']) {
    test(`${env} ${appearance} has no WCAG 2.2 AA violations`, async ({ page }, info) => {
      test.skip(info.project.name === 'phone' && env !== 'prism', 'phone covers Prism only');
      await open(page, `env=${env}&appearance=${appearance}&motion=reduced`);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});

test('every target meets the context size', async ({ page }, info) => {
  await open(page, 'motion=reduced');
  const expected = info.project.name === 'phone' ? 48 : 40;
  const target = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--target')));
  expect(target).toBe(expected);
  const small = await page.evaluate(t => [...document.querySelectorAll('.m-mat:not(.m-thumb):not(.m-ind):not(.m-toolbar), .m-seg-opt, .m-switch, .m-slider, .m-check, .m-tab, .m-menuitem')]
    .filter(el => el.checkVisibility())
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ el, r }) => r.height < t - .5 || (el.matches('.m-mat') && r.width < t - .5))
    .map(({ el, r }) => `${el.className} ${el.textContent.trim().slice(0, 20)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`), target);
  expect(small).toEqual([]);
});

test('Touch context sets 48 px targets on any device', async ({ page }) => {
  await open(page, 'context=touch&motion=reduced');
  const h = await page.getByRole('button', { name: 'Save draft' }).evaluate(el => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThanOrEqual(48);
});

test('buttons work from the keyboard; toggles report their state', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Continue' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#buttons-out')).toHaveText('Continue pressed.');
  const bold = page.getByRole('button', { name: 'Bold' });
  await bold.focus();
  await page.keyboard.press('Enter');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Unavailable' }).click({ force: true });
  await expect(page.locator('#buttons-out')).toHaveText('Bold pressed.');
});

test('segmented control: arrow keys choose, and the drop lands on the choice', async ({ page }) => {
  await open(page);
  const group = page.locator('#measure');
  await group.getByRole('radio', { name: 'Comfort' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Wide' })).toBeChecked();
  await expect.poll(() => group.evaluate(seg => {
    const ind = seg.querySelector('.m-ind'), opt = seg.querySelector('input:checked').closest('.m-seg-opt');
    return Math.abs(parseFloat(ind.style.left) - opt.offsetLeft) < 1 && Math.abs(parseFloat(ind.style.width) - opt.offsetWidth) < 1;
  }), { timeout: 2000 }).toBe(true);
});

test('switch: Space toggles it and the colour follows', async ({ page }) => {
  await open(page);
  const sw = page.getByRole('switch', { name: 'Follow the sun' });
  await expect(sw).not.toBeChecked();
  await sw.focus();
  await page.keyboard.press('Space');
  await expect(sw).toBeChecked();
  await expect.poll(() => sw.evaluate(input => parseFloat(input.closest('.m-switch').querySelector('.m-switch-track').style.getPropertyValue('--dye'))), { timeout: 2000 }).toBeGreaterThan(.99);
  const off = page.getByRole('switch', { name: 'Offline copies (unavailable)' });
  await expect(off).toBeDisabled();
});

test('a slow press sinks, and the drop settles within 0.9 s of release', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'pointer timing is checked on Desk');
  await open(page, 'motion=full');
  const button = page.getByRole('button', { name: 'Save draft' });
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(450);
  const held = await button.evaluate(el => parseFloat(el.style.getPropertyValue('--press')));
  expect(held).toBeGreaterThan(.3);
  await page.mouse.up();
  const released = Date.now();
  await expect.poll(() => button.evaluate(el => Math.abs(parseFloat(el.style.getPropertyValue('--press')))), { timeout: 2000, intervals: [50] }).toBeLessThan(.005);
  expect(Date.now() - released).toBeLessThan(900 + 250);   // settle time plus polling slack
});

test('reduced motion: the drop jumps instead of travelling', async ({ page }) => {
  await open(page, 'motion=reduced');
  const group = page.locator('#measure');
  await group.locator('.m-seg-opt', { hasText: 'Narrow' }).click();
  const placed = await group.evaluate(seg => new Promise(r => requestAnimationFrame(() => {
    const ind = seg.querySelector('.m-ind'), opt = seg.querySelector('input:checked').closest('.m-seg-opt');
    r(Math.abs(parseFloat(ind.style.left) - opt.offsetLeft) < 1);
  })));
  expect(placed).toBe(true);
});

test('solid tier: glass becomes opaque', async ({ page }) => {
  await open(page, 'tier=solid');
  const alpha = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--glass-a').trim());
  expect(alpha).toBe('1');
  const bg = await page.getByRole('button', { name: 'Save draft' }).evaluate(el => getComputedStyle(el.querySelector('.m-refract')).backgroundColor);
  expect(bg).not.toMatch(/rgba|\/ 0\.|, 0\.\d+\)$/);
});

test('the page loads without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
  await open(page);
  expect(errors).toEqual([]);
});

test('slider: arrow keys step the value and the drop follows', async ({ page }) => {
  await open(page);
  const slider = page.getByRole('slider', { name: /Text size/ });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('20');
  await expect(page.locator('#text-size-out')).toHaveText('20 px');
  await expect.poll(() => slider.evaluate(i => +parseFloat(i.closest('.m-slider').style.getPropertyValue('--m-value')).toFixed(2)), { timeout: 2000 }).toBe(.6);
  await expect(page.getByRole('slider', { name: /Glass tint/ })).toBeDisabled();
});

test('text field: an empty title is refused with a linked, visible message', async ({ page }) => {
  await open(page, 'motion=reduced');
  await page.getByRole('button', { name: 'Save note' }).click();
  const title = page.getByRole('textbox', { name: 'Note title' });
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(title).toBeFocused();
  await expect(title).toHaveAccessibleDescription('Give the note a title before saving.');
  await expect(page.locator('#note-title-msg')).toBeVisible();
  await title.fill('Shallow water');
  await expect(title).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#note-title-msg')).toBeHidden();
  await expect(page.getByRole('textbox', { name: 'Note', exact: true })).toHaveAccessibleDescription('Optional. Notes stay on this device.');
});

test('checkbox and radio: Space checks, arrow keys move within the group', async ({ page }) => {
  await open(page);
  const box = page.getByRole('checkbox', { name: 'Highlight the current sentence' });
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'All aids (some on)' })).toHaveJSProperty('indeterminate', true);
  const normal = page.getByRole('radio', { name: 'Normal' });
  await normal.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: 'Airy' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Dictionary (unavailable)' })).toBeDisabled();
});

test('tabs: arrow keys, Home and End select tabs and show their panels', async ({ page }) => {
  await open(page);
  const list = page.getByRole('tablist', { name: 'Field notes' });
  await list.getByRole('tab', { name: 'Read' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(list.getByRole('tab', { name: 'Listen' })).toHaveAttribute('aria-selected', 'true');
  await expect(list.getByRole('tab', { name: 'Listen' })).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: 'Listen' })).toBeVisible();
  await expect(page.locator('#panel-read')).toBeHidden();
  await page.keyboard.press('End');
  await expect(list.getByRole('tab', { name: 'Sources' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(list.getByRole('tab', { name: 'Read' })).toHaveAttribute('aria-selected', 'true');
  await expect(list.getByRole('tab', { name: 'Listen' })).toHaveAttribute('tabindex', '-1');
  await expect.poll(() => list.evaluate(l => {
    const ind = l.querySelector('.m-ind'), t = l.querySelector('[aria-selected="true"]');
    return Math.abs(parseFloat(ind.style.left) - t.offsetLeft) < 1;
  }), { timeout: 2000 }).toBe(true);
});

test('toolbar: one Tab stop, arrow keys, Home and End', async ({ page }) => {
  await open(page);
  const bar = page.getByRole('toolbar', { name: 'Article' });
  await bar.getByRole('button', { name: 'Back' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(bar.getByRole('button', { name: 'Reading options' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(bar.getByRole('button', { name: 'More' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(bar.getByRole('button', { name: 'Back' })).toBeFocused();
  const stops = await bar.evaluate(b => [...b.querySelectorAll('button')].filter(x => x.tabIndex === 0).length);
  expect(stops).toBe(1);
});

test('dialog: focus moves in, Escape closes, focus returns to its opener', async ({ page }) => {
  await open(page, 'motion=reduced');
  const opener = page.locator('[data-m-open="delete-dialog"]');
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Delete this note?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(/cannot be undone/);
  await expect(dialog.getByRole('button', { name: 'Keep note' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('#overlay-out')).toContainText('Note deleted');
});

test('sheet: opens from its button, closes on the backdrop and with Escape', async ({ page }) => {
  await open(page, 'motion=reduced');
  const opener = page.locator('.row [data-m-open="reading-sheet"]');
  await opener.click();
  const sheet = page.getByRole('dialog', { name: 'Reading options' });
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(sheet).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(sheet).toBeHidden();
});

test('menu: opens on its button, arrow keys move, Escape returns focus, choosing closes', async ({ page }) => {
  await open(page, 'motion=reduced');
  const trigger = page.getByRole('button', { name: 'Sort by' });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  await trigger.click();
  const menu = page.getByRole('menu', { name: 'Sort by' });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('menuitem', { name: 'Newest first' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Oldest first' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(menu.getByRole('menuitem', { name: 'Newest first' })).toBeFocused();
  await page.keyboard.press('t');
  await expect(menu.getByRole('menuitem', { name: 'Title' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu).toBeHidden();
  await expect(page.locator('#overlay-out')).toHaveText('Sorted: Title.');
});

test('menu inside the toolbar can open the dialog; disabled items are skipped', async ({ page }) => {
  await open(page, 'motion=reduced');
  await page.getByRole('button', { name: 'More' }).click();
  const menu = page.getByRole('menu', { name: 'More' });
  await expect(menu.getByRole('menuitem', { name: 'Copy link' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Delete note…' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Delete this note?' })).toBeVisible();
});

test('overlays have no WCAG 2.2 AA violations', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'checked on Desk');
  for (const [open_, name] of [['[data-m-open="delete-dialog"]', 'dialog'], ['.row [data-m-open="reading-sheet"]', 'sheet']]) {
    await open(page, 'env=canyon&appearance=dusk&motion=reduced');
    await page.locator(open_).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(v => `${name} ${v.id}`)).toEqual([]);
  }
  await open(page, 'env=canyon&appearance=dawn&motion=reduced');
  await page.getByRole('button', { name: 'Sort by' }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map(v => `menu ${v.id}`)).toEqual([]);
});

test('nothing overflows the page sideways', async ({ page }) => {
  await open(page, 'motion=reduced');
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
