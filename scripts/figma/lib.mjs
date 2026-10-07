import { createHash } from 'node:crypto'

export const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

/** Keep material, layout, content and component changes; exclude export timestamps. */
export function snapshot(document) {
  const nodes = {}
  const visit = (node) => {
    const properties = {}
    for (const key of [
      'name',
      'type',
      'visible',
      'characters',
      'style',
      'styles',
      'fills',
      'strokes',
      'strokeWeight',
      'effects',
      'cornerRadius',
      'rectangleCornerRadii',
      'cornerSmoothing',
      'absoluteBoundingBox',
      'layoutMode',
      'itemSpacing',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'componentId',
      'componentProperties',
      'boundVariables',
      'transitionNodeID',
      'transitionDuration',
      'transitionEasing',
      'reactions',
      'fillGeometry',
      'strokeGeometry',
      'relativeTransform',
      'constraints',
      'opacity',
      'blendMode',
    ])
      if (node[key] !== undefined) properties[key] = node[key]
    properties.children = (node.children ?? []).map((child) => child.id)
    nodes[node.id] = { name: node.name, type: node.type, hash: hash(properties) }
    for (const child of node.children ?? []) visit(child)
  }
  visit(document)
  return nodes
}

export function changes(previous, current) {
  const result = { added: [], changed: [], removed: [] }
  for (const [id, node] of Object.entries(current)) {
    if (!previous[id]) result.added.push({ id, ...node })
    else if (previous[id].hash !== node.hash) result.changed.push({ id, ...node })
  }
  for (const [id, node] of Object.entries(previous)) {
    if (!current[id]) result.removed.push({ id, ...node })
  }
  return result
}

export { validateTokens, tokenCss } from './token-contract.mjs'

export async function api(url, token, options = {}, send = fetch) {
  const { allow404, ...requestOptions } = options
  const result = await send(url, {
    ...requestOptions,
    headers: {
      ...(url.startsWith('https://api.figma.com/')
        ? { 'X-Figma-Token': token }
        : {
            authorization: `Bearer ${token}`,
            accept: 'application/vnd.github+json',
            'x-github-api-version': '2022-11-28',
          }),
      'content-type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(30_000),
  })
  if (allow404 && result.status === 404) return null
  if (!result.ok) throw new Error(`API request failed (${result.status}): ${new URL(url).pathname}`)
  return result.status === 204 ? null : result.json()
}
