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

/** Plugin export contract, independent of the Enterprise-only Variables REST API. */
export function validateTokens(bundle, config) {
  if (bundle?.fileKey !== config.fileKey || bundle.schemaVersion !== 1) {
    throw new Error('Token bundle does not match the configured Figma file/schema')
  }
  const entries = Object.entries(bundle.modes ?? {})
  if (
    entries.length !== config.themeModes.length ||
    entries.some(([mode]) => !config.themeModes.includes(mode))
  ) {
    throw new Error('Token modes must exactly match configured profiles')
  }
  entries.sort(([a], [b]) => config.themeModes.indexOf(a) - config.themeModes.indexOf(b))
  let keys
  for (const [, tokens] of entries) {
    const names = Object.keys(tokens).sort()
    if (names.length < 1 || names.length > 500) throw new Error('Invalid token count')
    if (keys && JSON.stringify(keys) !== JSON.stringify(names))
      throw new Error('Theme token names differ')
    keys = names
    const cssNames = new Set()
    for (const [name, token] of Object.entries(tokens)) {
      if (!/^[a-z][a-z0-9/-]{1,100}$/.test(name)) throw new Error('Unsafe token name')
      const cssName = name.replaceAll('/', '-')
      if (cssNames.has(cssName)) throw new Error('Colliding CSS token names')
      cssNames.add(cssName)
      if (token.type === 'COLOR') {
        for (const channel of ['r', 'g', 'b', 'a']) {
          const number = token.value?.[channel]
          if (!Number.isFinite(number) || number < 0 || number > 1)
            throw new Error('Invalid colour')
        }
      } else if (token.type === 'FLOAT') {
        if (!Number.isFinite(token.value) || token.value < 0 || token.value > 10000)
          throw new Error('Invalid numeric token')
        if (name.startsWith('opacity/') && token.value > 100)
          throw new Error('Figma opacity must be a percentage from 0 to 100')
      } else if (token.type === 'STRING') {
        const font =
          /^typography\/[a-z0-9-]+\/family$/.test(name) &&
          ['Manrope', 'Fraunces', 'Newsreader', 'JetBrains Mono'].includes(token.value)
        const easing =
          /^motion\/easing\/[a-z-]+$/.test(name) &&
          typeof token.value === 'string' &&
          /^cubic-bezier\(\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/.test(
            token.value,
          )
        if (!font && !easing) throw new Error('Unsupported or unsafe string token')
      } else throw new Error('Unsupported token type')
    }
  }
  // Remove timestamps and any additional plugin input from committed data.
  return {
    schemaVersion: 1,
    fileKey: config.fileKey,
    modes: Object.fromEntries(
      entries.map(([mode, tokens]) => [
        mode,
        Object.fromEntries(
          Object.keys(tokens)
            .sort()
            .map((name) => [name, { type: tokens[name].type, value: tokens[name].value }]),
        ),
      ]),
    ),
  }
}

export function tokenCss(bundle) {
  const css = [
    '/* Generated Meridian reference tokens. Reviewed adaptation into a product is required. */',
  ]
  for (const [mode, tokens] of Object.entries(bundle.modes)) {
    const selectors = {
      Dawn: ':root, [data-meridian="grass"]',
      Dusk: '.dark:not([data-meridian]), [data-meridian="grass"][data-theme="dark"], [data-meridian="grass"].dark:not([data-theme="light"])',
      PaperDawn: '[data-meridian="paper"]',
      PaperDusk:
        '[data-meridian="paper"][data-theme="dark"], [data-meridian="paper"].dark:not([data-theme="light"])',
    }
    if (!selectors[mode]) throw new Error('Unsupported CSS theme mode')
    css.push(`${selectors[mode]} {`)
    for (const [name, token] of Object.entries(tokens)) {
      let value = token.value
      if (token.type === 'COLOR') {
        const { r, g, b, a } = value
        value = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${Number(a.toFixed(4))})`
      } else if (token.type === 'STRING') {
        value = name.endsWith('/family') ? JSON.stringify(value) : value
      } else {
        value = Number(value.toFixed(4))
        if (name.startsWith('opacity/')) value = Number((value / 100).toFixed(4))
        else if (name.startsWith('motion/duration/')) value = `${value}ms`
        else if (
          /^(spacing|radius|size|layout|blur|stroke|focus|breakpoint|elevation)\//.test(name) ||
          /^typography\/[^/]+\/(size|line-height|letter-spacing)$/.test(name) ||
          /^grid\/[^/]+\/(gutter|margin)$/.test(name) ||
          name.startsWith('motion/translate/')
        )
          value = `${value}px`
      }
      css.push(`  --meridian-${name.replaceAll('/', '-')}: ${value};`)
    }
    css.push('}', '')
  }
  return css.join('\n')
}

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
