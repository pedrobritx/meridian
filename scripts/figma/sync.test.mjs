import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import config from '../../design/figma/config.json' with { type: 'json' }

// Run the actual CLI with mocked HTTP, rather than mirroring its orchestration.
async function installMock() {
  const { writeFileSync } = await import('node:fs')
  const config = JSON.parse(process.env.MOCK_CONFIG)
  const scenario = process.env.MOCK_SCENARIO
  const calls = []
  process.on('exit', () => writeFileSync(process.env.MOCK_CALLS, JSON.stringify(calls)))
  const response = (body, status = 200) =>
    new Response(body === null ? null : JSON.stringify(body), { status })
  globalThis.fetch = async (url, options = {}) => {
    url = String(url)
    const path = new URL(url).pathname
    const method = options.method ?? 'GET'
    const body = options.body ? JSON.parse(options.body) : null
    calls.push({
      url,
      method,
      body,
      authenticated: !!options.headers?.authorization || !!options.headers?.['X-Figma-Token'],
    })
    if (url.includes('/files/') && url.endsWith('/versions'))
      return response({
        versions: [{ id: 'v2', label: 'Approved', created_at: '2026-10-06T12:00:00Z' }],
      })
    if (url.includes('api.figma.com/v1/files/'))
      return response({
        document: {
          id: '0:0',
          name: 'Meridian',
          type: 'DOCUMENT',
          children: Object.values(config.frames).map((id) => ({
            id,
            name: 'Review',
            type: 'FRAME',
          })),
        },
      })
    if (url.includes('api.figma.com/v1/images/'))
      return response({
        images: Object.fromEntries(
          Object.values(config.frames).map((id) => [id, 'https://cdn.figma.com/preview.png']),
        ),
      })
    if (url.startsWith('https://cdn.figma.com/'))
      return new Response(new Uint8Array([137, 80, 78, 71]))
    if (path.endsWith('/git/ref/heads/main')) return response({ object: { sha: 'main-sha' } })
    if (path.endsWith('/git/ref/heads/design/figma-sync'))
      return ['replay', 'retry', 'recover', 'merged'].includes(scenario)
        ? response({ object: { sha: 'old-sha' } })
        : response({}, 404)
    if (path.includes('/git/commits/') && method !== 'POST')
      return response({ tree: { sha: path.endsWith('old-sha') ? 'old-tree' : 'main-tree' } })
    if (path.includes('/git/trees/') && method !== 'POST')
      return response({
        tree: ['replay', 'recover', 'merged'].includes(scenario)
          ? [{ path: 'design/figma/generated/snapshot.json', type: 'blob', sha: 'snapshot-blob' }]
          : [],
      })
    if (path.endsWith('/git/blobs/snapshot-blob'))
      return response({
        content: Buffer.from(JSON.stringify({ versionId: 'v2', nodes: {} })).toString('base64'),
      })
    if (path.endsWith('/issues') && method !== 'POST')
      return response(
        scenario === 'retry'
          ? [
              {
                number: 2,
                body: '<!-- meridian-figma:v2 -->',
                html_url: 'https://github.com/pedrobritx/meridian/issues/2',
              },
            ]
          : [],
      )
    if (path.endsWith('/issues') && method === 'POST')
      return response({ number: 2, html_url: 'https://github.com/pedrobritx/meridian/issues/2' })
    if (path.endsWith('/git/blobs') || path.endsWith('/git/trees') || path.endsWith('/git/commits'))
      return response({ sha: 'new-sha' })
    if (path.includes('/git/refs')) return response({})
    if (path.includes('/compare/'))
      return response({ files: scenario === 'merged' ? [] : [{ filename: 'snapshot.json' }] })
    if (path.endsWith('/pulls') && method !== 'POST')
      return response(scenario === 'replay' ? [{ number: 3 }] : [])
    if (path.endsWith('/pulls') && method === 'POST')
      return response({ html_url: 'https://github.com/pedrobritx/meridian/pull/3' })
    throw new Error('Unexpected mocked endpoint: ' + url)
  }
}

function run(action, scenario = 'new', tokens) {
  const dir = mkdtempSync(join(tmpdir(), 'figma-bridge-'))
  const callsFile = join(dir, 'calls.json')
  const eventFile = join(dir, 'event.json')
  const mockFile = join(dir, 'mock.mjs')
  writeFileSync(
    eventFile,
    JSON.stringify({
      action,
      client_payload: { file_key: config.fileKey, version_id: 'v2', tokens },
    }),
  )
  writeFileSync(mockFile, `await (${installMock.toString()})()`)
  try {
    execFileSync(
      process.execPath,
      ['--import', mockFile, fileURLToPath(new URL('./sync.mjs', import.meta.url))],
      {
        env: {
          ...process.env,
          GITHUB_EVENT_PATH: eventFile,
          GITHUB_REPOSITORY: config.repository,
          GITHUB_TOKEN: 'fake-github',
          FIGMA_ACCESS_TOKEN: 'fake-figma',
          MOCK_SCENARIO: scenario,
          MOCK_CONFIG: JSON.stringify(config),
          MOCK_CALLS: callsFile,
        },
        encoding: 'utf8',
      },
    )
    return JSON.parse(readFileSync(callsFile))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('approved version exports diffs, configured previews, an issue and a draft PR', () => {
  const calls = run('figma-version')
  const cdn = calls.filter((call) => call.url.startsWith('https://cdn.figma.com'))
  assert.equal(cdn.length, Object.keys(config.frames).length)
  assert.ok(cdn.every((call) => !call.authenticated))
  const tree = calls.find((call) => call.url.endsWith('/git/trees') && call.method === 'POST').body
  assert.ok(tree.tree.some((entry) => entry.path.endsWith('snapshot.json')))
  assert.ok(tree.tree.some((entry) => entry.path.endsWith('changes.json')))
  const pr = calls.find((call) => call.url.endsWith('/pulls') && call.method === 'POST').body
  assert.equal(pr.draft, true)
  assert.equal(pr.base, 'main')
  assert.equal(pr.head, 'design/figma-sync')
})

test('replayed version makes no writes or downloads', () => {
  const calls = run('figma-version', 'replay')
  assert.ok(calls.every((call) => call.method === 'GET'))
  assert.ok(calls.every((call) => !call.url.startsWith('https://cdn.figma.com')))
})

test('retry reuses the issue and incorporates current main ancestry', () => {
  const calls = run('figma-version', 'retry')
  assert.ok(!calls.some((call) => call.url.endsWith('/issues') && call.method === 'POST'))
  const commit = calls.find(
    (call) => call.url.endsWith('/git/commits') && call.method === 'POST',
  ).body
  assert.deepEqual(commit.parents, ['old-sha', 'main-sha'])
})

test('retry after a committed export recovers a missing PR without re-exporting', () => {
  const calls = run('figma-version', 'recover')
  const writes = calls.filter((call) => call.method !== 'GET')
  assert.equal(writes.length, 1)
  assert.ok(writes[0].url.endsWith('/pulls'))
  assert.equal(writes[0].body.draft, true)
})

test('an already merged bot branch does not reopen an empty PR', () => {
  const calls = run('figma-version', 'merged')
  assert.ok(calls.every((call) => call.method === 'GET'))
})

test('plugin publication generates CSS without the Figma REST API', () => {
  const token = { type: 'FLOAT', value: 24 }
  const bundle = {
    schemaVersion: 1,
    fileKey: config.fileKey,
    modes: Object.fromEntries(config.themeModes.map((mode) => [mode, { 'radius/md': token }])),
  }
  const calls = run('figma-tokens', 'new', bundle)
  assert.ok(!calls.some((call) => call.url.includes('figma.com')))
  const tree = calls.find((call) => call.url.endsWith('/git/trees') && call.method === 'POST').body
  assert.match(tree.tree.find((entry) => entry.path.endsWith('meridian.css')).content, /24px/)
})


test('every export request targets Meridian rather than a product repository', () => {
  const calls = run('figma-version')
  const github = calls.filter(call => call.url.startsWith('https://api.github.com/'))
  assert.ok(github.length > 0)
  assert.ok(github.every(call => new URL(call.url).pathname.startsWith('/repos/pedrobritx/meridian/')))
  const pr = github.find(call => call.url.endsWith('/pulls') && call.method === 'POST')
  assert.match(pr.body.body, /github\.com\/pedrobritx\/meridian\/issues\//)
  assert.doesNotMatch(pr.body.body, /into Lexis|repos\/pedrobritx\/lexis/)
})
