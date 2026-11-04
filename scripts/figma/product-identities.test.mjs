import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalProductName, displayIdentity } from './product-identities.mjs'
import { changes, hash, snapshot } from './lib.mjs'

const original = Buffer.from('6273646c', 'hex').toString('utf8')

test('canonical display names retain original source labels reversibly', () => {
  const label = `Text / ${original} + product`
  const result = displayIdentity(label)
  assert.equal(result.name, 'Text / polaris + product')
  assert.equal(Buffer.from(result.sourceNameUtf8Hex, 'hex').toString('utf8'), label)
  assert.equal(canonicalProductName('Unrelated labels remain unchanged'), 'Unrelated labels remain unchanged')
  assert.equal(canonicalProductName('prefix' + original + 'suffix'), 'prefix' + original + 'suffix')
  assert.deepEqual(displayIdentity('Polaris'), { name: 'Polaris' })
  assert.deepEqual(displayIdentity(undefined), { name: undefined })
})

test('display normalization preserves raw capture hashes and detects live renames', () => {
  const source = { id: '1:1', name: original, type: 'TEXT', characters: original }
  const current = snapshot(source)
  assert.equal(current['1:1'].name, 'polaris')
  const capturedHash = hash({ name: original, type: 'TEXT', characters: original, children: [] })
  assert.equal(current['1:1'].hash, capturedHash)
  const prior = { '1:1': { name: original, type: 'TEXT', hash: capturedHash } }
  assert.deepEqual(changes(prior, current), { added: [], changed: [], removed: [] })
  const live = snapshot({ ...source, name: 'polaris', characters: 'polaris' })
  assert.deepEqual(changes(current, live).changed.map(n => n.id), ['1:1'])
  assert.equal(live['1:1'].sourceNameUtf8Hex, undefined)
})
