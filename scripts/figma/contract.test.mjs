import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { tokenCss, validateTokens } from './lib.mjs'

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url)))
const config = await read('../../design/figma/config.json')
const bundle = await read('../../design/figma/generated/tokens.json')
const source = await read('../../design/figma/generated/figma-source.json')

test('committed CSS is reproducible from the validated token snapshot', async () => {
  assert.equal(
    await readFile(new URL('../../design/figma/generated/meridian.css', import.meta.url), 'utf8'),
    tokenCss(validateTokens(bundle, config)),
  )
})

test('native provenance has resolvable aliases, explicit scopes and matching code syntax', () => {
  const variables = new Map(
    source.collections.flatMap((c) => c.variables.map((v) => [v.id, { ...v, collection: c }])),
  )
  function resolve(v, theme, seen = new Set()) {
    assert.ok(v, 'Alias target exists')
    assert.ok(!seen.has(v.id), `No alias cycle at ${v.name}`)
    seen.add(v.id)
    const mode =
      v.collection.modes.find((m) => m.name === theme) ??
      v.collection.modes.find((m) => m.name === (theme.startsWith('Paper') ? 'Paper' : 'Grass')) ??
      v.collection.modes[0]
    const value = v.values[mode.modeId]
    return value?.type === 'VARIABLE_ALIAS' ? resolve(variables.get(value.id), theme, seen) : value
  }
  for (const v of variables.values()) {
    assert.ok(Array.isArray(v.scopes) && !v.scopes.includes('ALL_SCOPES'), v.name)
    assert.equal(v.code, `var(--meridian-${v.name.replaceAll('/', '-')})`)
    for (const theme of config.themeModes) assert.notEqual(resolve(v, theme), undefined)
  }
  // Provenance is an explicitly captured snapshot. Future plugin exports may advance independently.
  assert.equal(source.fileKey, config.fileKey)
})

function luminance(c) {
  const channel = (n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
  return channel(c.r) * 0.2126 + channel(c.g) * 0.7152 + channel(c.b) * 0.0722
}

test('opaque reference text, action, status, focus and control pairs meet AA thresholds', () => {
  const pairs = []
  for (const bg of ['page', 'surface', 'sunken', 'overlay']) {
    for (const fg of ['text/primary', 'text/secondary', 'text/muted', 'link/default'])
      pairs.push([`color/${fg}`, `color/bg/${bg}`, 4.5])
    for (const fg of ['border/control', 'focus/ring'])
      pairs.push([`color/${fg}`, `color/bg/${bg}`, 3])
  }
  for (const status of ['success', 'warning', 'error', 'info'])
    pairs.push([`color/status/${status}`, `color/status/${status}-bg`, 4.5])
  pairs.push(
    ['color/action/on-primary', 'color/action/primary', 4.5],
    ['color/action/on-primary', 'color/action/hover', 4.5],
    ['color/action/on-destructive', 'color/action/destructive', 4.5],
  )
  for (const [theme, tokens] of Object.entries(bundle.modes))
    for (const [fg, bg, min] of pairs) {
      const a = tokens[fg].value,
        b = tokens[bg].value
      assert.equal(a.a, 1)
      assert.equal(b.a, 1)
      const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y)
      const ratio = (high + 0.05) / (low + 0.05)
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1; needs ${min}:1`)
    }
})
