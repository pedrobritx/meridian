// Text contrast as rendered. Axe cannot measure text on glass (it reports it as incomplete),
// so this check hides each text, photographs what lies behind it and compares the two.
import { test, expect } from '@playwright/test';

const ENVS = ['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon'];
const TEXT = [
  '.m-mat:not(:disabled):not(.m-icon) > .m-label',
  '.m-seg-opt:not(:has(input:disabled)) > span',
  '.m-switch:not(:has(input:disabled)) > span:first-child',
  '.m-check:not(:has(input:disabled)) > span', '.m-tab:not(:disabled)', '.m-field > label', '.m-field-hint', '.m-tabpanel .sample',
  '.panel > h2', '.panel > p:not(.output)', 'header p',
].join(', ');

async function measure(page, el) {
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box || box.width < 2 || box.height < 2) return null;
  const fg = await el.evaluate(node => { const c = getComputedStyle(node).color; node.dataset.c = node.style.color; node.style.color = 'transparent'; return c; });
  const png = await page.screenshot({ clip: box, scale: 'css', animations: 'disabled' });
  await el.evaluate(node => { node.style.color = node.dataset.c; delete node.dataset.c; });
  return page.evaluate(async ({ b64, fg }) => {
    const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const px = x.getImageData(0, 0, c.width, c.height).data;
    x.clearRect(0, 0, 1, 1); x.fillStyle = fg; x.fillRect(0, 0, 1, 1); const f = x.getImageData(0, 0, 1, 1).data;
    const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const L = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
    const lums = []; for (let i = 0; i < px.length; i += 4) lums.push(L(px[i], px[i + 1], px[i + 2]));
    lums.sort((a, b) => a - b);
    const bg = lums[Math.floor(lums.length / 2)], text = L(f[0], f[1], f[2]);
    return (Math.max(bg, text) + .05) / (Math.min(bg, text) + .05);
  }, { b64: png.toString('base64'), fg });
}

for (const env of ENVS) for (const appearance of ['dawn', 'dusk']) {
  test(`text contrast as rendered: ${env} ${appearance}`, async ({ page }, info) => {
    test.skip(info.project.name === 'phone', 'measured on Desk');
    await page.goto(`/components/?env=${env}&appearance=${appearance}&motion=reduced`);
    await page.waitForFunction(() => document.querySelectorAll('.m-ind').length > 0);
    const failures = [];
    for (const el of await page.locator(TEXT).all()) {
      if (!(await el.isVisible())) continue;
      const ratio = await measure(page, el);
      if (ratio !== null && ratio < 4.5) failures.push(`${(await el.textContent()).trim().slice(0, 30)}: ${ratio.toFixed(2)}:1`);
    }
    expect(failures).toEqual([]);
  });
}
