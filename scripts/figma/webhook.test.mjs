import assert from 'node:assert/strict'
import test from 'node:test'
import { handleFigmaWebhook } from '../../integrations/figma/webhook.mjs'

const env = { FIGMA_WEBHOOK_PASSCODE: 'a'.repeat(48), FIGMA_GITHUB_DISPATCH_TOKEN: 'github-secret' }
const payload = (overrides = {}) => ({
  passcode: env.FIGMA_WEBHOOK_PASSCODE,
  file_key: 'aJ2f6aYX9KBucAdPsCmkXn',
  event_type: 'FILE_VERSION_UPDATE',
  version_id: '12345',
  label: 'Meridian 0.2',
  ...overrides,
})
const request = (body) =>
  new Request('https://meridian.example/api/figma-webhook', {
    method: 'POST',
    body: JSON.stringify(body),
  })
const never = async () => {
  throw new Error('Must not dispatch')
}

test('requires configuration and verifies passcode before any external action', async () => {
  assert.equal((await handleFigmaWebhook(request(payload()), {}, never)).status, 503)
  for (const passcode of ['', 'b'.repeat(48), undefined, 123]) {
    assert.equal((await handleFigmaWebhook(request(payload({ passcode })), env, never)).status, 401)
  }
})

test('PING confirms authentication without dispatching work', async () => {
  const result = await handleFigmaWebhook(request(payload({ event_type: 'PING' })), env, never)
  assert.equal(result.status, 200)
  assert.deepEqual(await result.json(), { data: { pong: true } })
})

test('ignores unrelated files, autosaves and unnamed versions', async () => {
  for (const overrides of [
    { file_key: 'other' },
    { event_type: 'FILE_UPDATE' },
    { label: '' },
    { label: null },
    { label: {} },
  ]) {
    assert.equal((await handleFigmaWebhook(request(payload(overrides)), env, never)).status, 202)
  }
})

test('forwards a minimal approved event without passcodes or arbitrary fields', async () => {
  const result = await handleFigmaWebhook(
    request(payload({ arbitrary: 'do not forward' })),
    env,
    async (url, options) => {
      assert.equal(url, 'https://api.github.com/repos/pedrobritx/meridian/dispatches')
      assert.deepEqual(JSON.parse(options.body), {
        event_type: 'figma-version',
        client_payload: { file_key: 'aJ2f6aYX9KBucAdPsCmkXn', version_id: '12345' },
      })
      assert.doesNotMatch(options.body, /passcode|arbitrary|github-secret/)
      return new Response(null, { status: 204 })
    },
  )
  assert.equal(result.status, 202)
  assert.deepEqual(await result.json(), { data: { queued: true } })
})

test('malformed JSON, version IDs and oversized streamed bodies are rejected', async () => {
  const bad = new Request('https://example.com', { method: 'POST', body: '{' })
  assert.equal((await handleFigmaWebhook(bad, env, never)).status, 400)
  assert.equal(
    (await handleFigmaWebhook(request(payload({ version_id: '../../main' })), env, never)).status,
    400,
  )
  assert.equal(
    (await handleFigmaWebhook(request(payload({ padding: 'x'.repeat(17000) })), env, never)).status,
    413,
  )
})

test('dispatch errors stay retryable without exposing upstream secrets', async () => {
  for (const send of [
    async () => new Response('private data', { status: 403 }),
    async () => {
      throw new Error('secret')
    },
  ]) {
    const result = await handleFigmaWebhook(request(payload()), env, send)
    assert.equal(result.status, 502)
    assert.doesNotMatch(JSON.stringify(await result.json()), /private|secret/)
  }
})
