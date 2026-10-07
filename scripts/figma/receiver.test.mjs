import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { createHandler } from '../../api/figma-webhook.mjs'

const env = { FIGMA_WEBHOOK_PASSCODE: 'a'.repeat(48), FIGMA_GITHUB_DISPATCH_TOKEN: 'test-only' }
const ping = { event_type: 'PING', passcode: env.FIGMA_WEBHOOK_PASSCODE }
const never = async () => { throw Error('PING must not dispatch') }
async function receive(req, settings = env) {
  const headers = {}
  const res = { setHeader(k, v) { headers[k] = v }, end(body) { this.body = body } }
  await createHandler(settings, never)(req, res)
  return { status: res.statusCode, body: res.body, headers }
}
test('optional Node receiver accepts parsed and streamed Figma requests', async () => {
  for (const body of [ping, JSON.stringify(ping), Buffer.from(JSON.stringify(ping)), undefined]) {
    const req = Readable.from([Buffer.from(JSON.stringify(ping))])
    Object.assign(req, { method: 'POST', headers: {}, body })
    const result = await receive(req)
    assert.equal(result.status, 200)
    assert.deepEqual(JSON.parse(result.body), { data: { pong: true } })
  }
})
test('optional Node receiver rejects GET and reports missing activation credentials', async () => {
  assert.equal((await receive({ method: 'GET' })).status, 405)
  const result = await receive({ method: 'POST', headers: {}, body: ping }, {})
  assert.equal(result.status, 503)
  assert.equal(JSON.parse(result.body).error.code, 'figma/not_configured')
})
