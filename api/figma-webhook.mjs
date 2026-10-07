import { Readable } from 'node:stream'
import { handleFigmaWebhook } from '../integrations/figma/webhook.mjs'

// Optional Vercel Node function. GitHub Pages cannot execute this receiver.
export function createHandler(env = process.env, send = fetch) {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      res.statusCode = 405
      return res.end()
    }
    const body = req.body === undefined
      ? Readable.toWeb(req)
      : typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body)
    const request = new Request('https://receiver.invalid/api/figma-webhook', {
      method: 'POST', headers: req.headers, body, duplex: 'half',
    })
    const result = await handleFigmaWebhook(request, env, send)
    res.statusCode = result.status
    res.setHeader('Content-Type', 'application/json')
    res.end(await result.text())
  }
}

export default createHandler()
