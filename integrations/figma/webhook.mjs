import { timingSafeEqual } from 'node:crypto'

const FILE_KEY = 'aJ2f6aYX9KBucAdPsCmkXn'
const REPOSITORY = 'pedrobritx/meridian'
const MAX_BODY = 16_384

const reply = (status, data) => Response.json(data, { status })

/** Authenticate Figma's payload passcode before forwarding a minimal event. */
export async function handleFigmaWebhook(request, env, send = fetch) {
  const secret = env.FIGMA_WEBHOOK_PASSCODE
  if (!secret || !env.FIGMA_GITHUB_DISPATCH_TOKEN) {
    return reply(503, { error: { code: 'figma/not_configured' } })
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY) {
    return reply(413, { error: { code: 'figma/body_too_large' } })
  }
  // Bound streamed requests too; content-length is not trustworthy.
  const reader = request.body?.getReader()
  if (!reader) return reply(400, { error: { code: 'figma/invalid_payload' } })
  const chunks = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY) {
      await reader.cancel()
      return reply(413, { error: { code: 'figma/body_too_large' } })
    }
    chunks.push(Buffer.from(value))
  }
  let payload
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return reply(400, { error: { code: 'figma/invalid_payload' } })
  }
  const supplied = Buffer.from(typeof payload?.passcode === 'string' ? payload.passcode : '')
  const expected = Buffer.from(secret)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return reply(401, { error: { code: 'figma/invalid_passcode' } })
  }
  if (payload.event_type === 'PING') return reply(200, { data: { pong: true } })
  if (payload.file_key !== FILE_KEY) return reply(202, { data: { ignored: true } })
  // Deliberately ignore autosaves. Only deliberate named versions are approved exports.
  if (
    payload.event_type !== 'FILE_VERSION_UPDATE' ||
    typeof payload.label !== 'string' ||
    !payload.label.trim()
  ) {
    return reply(202, { data: { ignored: true } })
  }
  if (typeof payload.version_id !== 'string' || !/^[\w-]{1,128}$/.test(payload.version_id)) {
    return reply(400, { error: { code: 'figma/invalid_version' } })
  }
  try {
    const result = await send(`https://api.github.com/repos/${REPOSITORY}/dispatches`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.FIGMA_GITHUB_DISPATCH_TOKEN}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'figma-version',
        client_payload: { file_key: FILE_KEY, version_id: payload.version_id },
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!result.ok) return reply(502, { error: { code: 'figma/dispatch_failed' } })
    return reply(202, { data: { queued: true } })
  } catch {
    return reply(502, { error: { code: 'figma/dispatch_failed' } })
  }
}
