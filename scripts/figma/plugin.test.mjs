import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import { validateTokens } from './lib.mjs'

test('actual plugin resolves native aliases and exports the complete semantic snapshot', async () => {
  const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url)))
  const source = await read('../../design/figma/generated/figma-source.json')
  const expected = await read('../../design/figma/generated/tokens.json')
  const config = await read('../../design/figma/config.json')
  let result
  const figma = {
    fileKey: config.fileKey,
    showUI() {},
    ui: {
      postMessage(message) {
        result = message
      },
    },
    variables: {
      async getLocalVariableCollectionsAsync() {
        return source.collections
      },
      async getLocalVariablesAsync() {
        return source.collections.flatMap((c) =>
          c.variables.map((v) => ({
            id: v.id,
            name: v.name,
            variableCollectionId: c.id,
            resolvedType: v.type,
            valuesByMode: v.values,
          })),
        )
      },
    },
  }
  runInNewContext(
    await readFile(new URL('../../design/figma/plugin/code.js', import.meta.url), 'utf8'),
    { figma, __html__: '' },
  )
  await figma.ui.onmessage({ type: 'export' })
  assert.equal(result.type, 'tokens')
  assert.deepEqual(
    validateTokens(JSON.parse(JSON.stringify(result.tokens)), config),
    validateTokens(expected, config),
  )
  const colour = source.collections.find((c) => c.name === 'Meridian / Colour')
  colour.modes = colour.modes.filter((m) => m.name !== 'PaperDusk')
  await figma.ui.onmessage({ type: 'export' })
  assert.equal(result.type, 'error')
  assert.match(result.message, /Missing profile mode/)
})
