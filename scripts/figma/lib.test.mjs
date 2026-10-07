import assert from 'node:assert/strict'
import test from 'node:test'
import { api, changes, snapshot, tokenCss, validateTokens } from './lib.mjs'
import projectConfig from '../../design/figma/config.json' with { type: 'json' }

const config = { ...projectConfig, themeModes: ['Dawn', 'Dusk'] }

const tokens = () => ({
  schemaVersion: 1,
  fileKey: config.fileKey,
  modes: {
    Dawn: {
      'color/bg/page': { type: 'COLOR', value: { r: 1, g: 0.5, b: 0, a: 0.75 } },
      'radius/md': { type: 'FLOAT', value: 24 },
    },
    Dusk: {
      'color/bg/page': { type: 'COLOR', value: { r: 0, g: 0.1, b: 0.2, a: 1 } },
      'radius/md': { type: 'FLOAT', value: 24 },
    },
  },
})

test('layer diff detects content, material, structure and removed nodes', () => {
  const old = snapshot({
    id: '0:1',
    name: 'Page',
    type: 'CANVAS',
    children: [
      { id: '1:1', name: 'Button', type: 'TEXT', characters: 'Continue' },
      { id: '1:2', name: 'Old', type: 'FRAME' },
    ],
  })
  const current = snapshot({
    id: '0:1',
    name: 'Page',
    type: 'CANVAS',
    children: [
      {
        id: '1:1',
        name: 'Button',
        type: 'TEXT',
        characters: 'Save',
        effects: [{ type: 'BACKGROUND_BLUR', radius: 20 }],
      },
      { id: '1:3', name: 'New', type: 'FRAME' },
    ],
  })
  const diff = changes(old, current)
  assert.deepEqual(
    diff.added.map((n) => n.id),
    ['1:3'],
  )
  assert.deepEqual(
    diff.removed.map((n) => n.id),
    ['1:2'],
  )
  assert.deepEqual(
    diff.changed.map((n) => n.id),
    ['0:1', '1:1'],
  )
})

test('timestamps do not produce visual diffs', () => {
  const node = { id: '1:1', name: 'Card', type: 'FRAME' }
  assert.deepEqual(
    snapshot({ ...node, lastModified: 'yesterday' }),
    snapshot({ ...node, lastModified: 'today' }),
  )
})

test('organic vector path edits are detected even when bounds stay unchanged', () => {
  const node = {
    id: '1:1',
    name: 'Glass',
    type: 'VECTOR',
    absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
  }
  const before = snapshot({
    ...node,
    fillGeometry: [{ path: 'M 0 0 L 100 100', windingRule: 'NONZERO' }],
  })
  const after = snapshot({
    ...node,
    fillGeometry: [{ path: 'M 0 0 C 25 75 75 25 100 100', windingRule: 'NONZERO' }],
  })
  assert.deepEqual(
    changes(before, after).changed.map((n) => n.id),
    ['1:1'],
  )
})

test('validated Dawn/Dusk tokens produce namespaced CSS with alpha and dimensions', () => {
  const bundle = validateTokens(tokens(), config)
  const css = tokenCss(bundle)
  assert.match(css, /:root,/)
  assert.match(css, /\.dark:not\(\[data-meridian\]\)/)
  assert.match(css, /--meridian-color-bg-page: rgb\(255 128 0 \/ 0.75\)/)
  assert.match(css, /--meridian-radius-md: 24px/)
})

test('rejects mismatched files, incomplete themes, aliases and invalid colours', () => {
  for (const change of [
    (b) => {
      b.fileKey = 'other'
    },
    (b) => {
      delete b.modes.Dusk
    },
    (b) => {
      delete b.modes.Dusk['radius/md']
    },
    (b) => {
      b.modes.Dawn['radius/md'].value = -1
    },
    (b) => {
      b.modes.Dawn['radius/md'].value = { type: 'VARIABLE_ALIAS' }
    },
    (b) => {
      b.modes.Dawn['color/bg/page'].value.a = 2
    },
    (b) => {
      b.modes.Dawn['radius/md'].type = 'STRING'
    },
  ]) {
    const bundle = tokens()
    change(bundle)
    assert.throws(() => validateTokens(bundle, config))
  }
})

test('rejects CSS injection and colliding names', () => {
  const bundle = tokens()
  for (const mode of Object.values(bundle.modes))
    mode['color/bg/page; } body {'] = { type: 'FLOAT', value: 10 }
  assert.throws(() => validateTokens(bundle, config))
  const collision = tokens()
  for (const mode of Object.values(collision.modes))
    mode['radius-md'] = { type: 'FLOAT', value: 10 }
  assert.throws(() => validateTokens(collision, config), /Colliding/)
})

test('API errors do not include upstream response bodies or credentials', async () => {
  await assert.rejects(
    api(
      'https://api.github.com/repos/x/y',
      'secret',
      {},
      async () => new Response('sensitive response', { status: 403 }),
    ),
    (error) => {
      assert.doesNotMatch(error.message, /secret|sensitive/)
      return true
    },
  )
})

test('exports font families, weights, opacity, grid, easing and durations with correct units', () => {
  const values = {
    'typography/h1/family': { type: 'STRING', value: 'Fraunces' },
    'typography/h1/weight': { type: 'FLOAT', value: 400 },
    'typography/h1/size': { type: 'FLOAT', value: 40 },
    'opacity/disabled': { type: 'FLOAT', value: 48 },
    'motion/duration/contact': { type: 'FLOAT', value: 80 },
    'motion/easing/settle': { type: 'STRING', value: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    'grid/mobile/columns': { type: 'FLOAT', value: 4 },
    'grid/mobile/gutter': { type: 'FLOAT', value: 16 },
    'z/dialog': { type: 'FLOAT', value: 50 },
  }
  const bundle = validateTokens(
    { schemaVersion: 1, fileKey: config.fileKey, modes: { Dawn: values, Dusk: values } },
    config,
  )
  const css = tokenCss(bundle)
  for (const declaration of [
    '--meridian-typography-h1-family: "Fraunces";',
    '--meridian-typography-h1-weight: 400;',
    '--meridian-typography-h1-size: 40px;',
    '--meridian-opacity-disabled: 0.48;',
    '--meridian-motion-duration-contact: 80ms;',
    '--meridian-grid-mobile-columns: 4;',
    '--meridian-grid-mobile-gutter: 16px;',
    '--meridian-z-dialog: 50;',
    '--meridian-motion-easing-settle: cubic-bezier(0.2, 0.8, 0.2, 1);',
  ])
    assert.ok(css.includes(declaration), declaration)
})

test('string token validation rejects CSS injection and unsupported families', () => {
  for (const [name, value] of [
    ['typography/h1/family', 'Fraunces"; color:red;'],
    ['typography/h1/family', 'Unknown Font'],
    ['motion/easing/settle', 'linear; background:url(https://example.com)'],
    ['motion/easing/settle', 'cubic-bezier(2, 0, 0, 1)'],
    ['arbitrary/string', 'Manrope'],
  ]) {
    const values = { [name]: { type: 'STRING', value } }
    assert.throws(
      () =>
        validateTokens(
          { schemaVersion: 1, fileKey: config.fileKey, modes: { Dawn: values, Dusk: values } },
          config,
        ),
      /string token/,
    )
  }
})
