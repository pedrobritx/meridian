import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { tokenCss, validateTokens } from './lib.mjs'

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url)))
const config = await read('../../design/figma/config.json')
const bundle = await read('../../design/figma/generated/tokens.json')

test('both profiles resolve shape, motion and distinct foreground/background roles', () => {
  assert.deepEqual(Object.keys(validateTokens(bundle, config).modes), [
    'Dawn',
    'Dusk',
    'PaperDawn',
    'PaperDusk',
  ])
  for (const mode of config.themeModes) assert.equal(bundle.modes[mode]['radius/md'].value, 24)
  assert.equal(bundle.modes.Dawn['radius/sm'].value, 24)
  assert.equal(bundle.modes.PaperDawn['radius/sm'].value, 14)
  assert.ok(Math.abs(bundle.modes.PaperDusk['motion/scale/pressed'].value - 0.99) < 1e-6)
  assert.notDeepEqual(
    bundle.modes.Dawn['color/action/primary'],
    bundle.modes.PaperDawn['color/action/primary'],
  )
  assert.notEqual(
    bundle.modes.Dawn['motion/easing/settle'].value,
    bundle.modes.PaperDawn['motion/easing/settle'].value,
  )
  const incomplete = structuredClone(bundle)
  delete incomplete.modes.PaperDusk
  assert.throws(() => validateTokens(incomplete, config), /modes/)
})

test('generated profile selectors are distinct and unsupported profiles cannot silently become dark', () => {
  const css = tokenCss(bundle)
  const reversed = { ...bundle, modes: Object.fromEntries(Object.entries(bundle.modes).reverse()) }
  assert.equal(tokenCss(validateTokens(reversed, config)), css)
  assert.match(css, /\[data-meridian="paper"\]\[data-theme="dark"\]/)
  assert.match(css, /\[data-meridian="grass"\]\[data-theme="dark"\]/)
  assert.equal((css.match(/--meridian-radius-md: 24px;/g) ?? []).length, 4)
  assert.throws(() => tokenCss({ modes: { Unknown: bundle.modes.Dawn } }), /Unsupported/)
})

test('captured native instance round trips and workflow destinations satisfy the interaction contract', async () => {
  const report = await read('../../design/meridian/interaction-report.json')
  assert.equal(report.tests.length, 8)
  assert.ok(report.tests.every((t) => t.pass))
  for (const page of report.pages) {
    assert.deepEqual(page.invalidDestinations, [])
    assert.deepEqual(page.missingFlowDestinations, [])
    assert.deepEqual(page.overflow, [])
    for (const segment of page.segments) assert.deepEqual(segment.bold, [segment.selected])
  }
})
