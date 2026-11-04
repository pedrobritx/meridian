import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { canonicalProductName } from '../scripts/figma/product-identities.mjs'

test('tracked product labels and paths remain canonical', () => {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  for (const file of files) {
    if (!existsSync(file)) continue
    assert.equal(canonicalProductName(file), file, file)
    const data = readFileSync(file)
    // Binary assets and random checksum substrings are not product branding.
    if (data.includes(0)) continue
    const text = data.toString('utf8')
    assert.equal(canonicalProductName(text), text, file)
  }
})
