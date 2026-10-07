import { readFile } from 'node:fs/promises'
import { api } from './lib.mjs'

const config = JSON.parse(
  await readFile(new URL('../../design/figma/config.json', import.meta.url)),
)
const token = process.env.FIGMA_ACCESS_TOKEN
const passcode = process.env.FIGMA_WEBHOOK_PASSCODE
const endpoint = process.env.FIGMA_WEBHOOK_URL
if (!token || !passcode || !endpoint)
  throw new Error('Set FIGMA_ACCESS_TOKEN, FIGMA_WEBHOOK_PASSCODE and FIGMA_WEBHOOK_URL locally')
if (passcode.length < 32 || passcode.length > 100)
  throw new Error('Use a random passcode of 32–100 characters')
const url = new URL(endpoint)
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
  throw new Error('Use a public HTTPS webhook URL without credentials or query parameters')
const pathname = '/api/figma-webhook'
if (url.pathname !== pathname) throw new Error(`Webhook URL must end in ${pathname}`)
const apiBase = 'https://api.figma.com/v2/webhooks'
const existing = await api(`${apiBase}?context=file&context_id=${config.fileKey}`, token)
const matching = existing.webhooks.find(
  (hook) => hook.endpoint === endpoint && hook.event_type === 'FILE_VERSION_UPDATE',
)
if (matching) {
  console.log(`Webhook already exists (${matching.id}, ${matching.status}). No secret was changed.`)
} else {
  const created = await api(apiBase, token, {
    method: 'POST',
    body: JSON.stringify({
      event_type: 'FILE_VERSION_UPDATE',
      context: 'file',
      context_id: config.fileKey,
      endpoint,
      passcode,
      description: 'Meridian named versions → Meridian design review',
      status: 'ACTIVE',
    }),
  })
  console.log(`Created webhook ${created.id}. Figma will send a PING to verify the receiver.`)
}
