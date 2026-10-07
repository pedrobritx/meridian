import { readFile } from 'node:fs/promises'
import { api, changes, hash, snapshot, tokenCss, validateTokens } from './lib.mjs'

const config = JSON.parse(
  await readFile(new URL('../../design/figma/config.json', import.meta.url)),
)
const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH))
const githubToken = process.env.GITHUB_TOKEN
const figmaToken = process.env.FIGMA_ACCESS_TOKEN
if (!githubToken) throw new Error('GITHUB_TOKEN is required')
if (process.env.GITHUB_REPOSITORY !== config.repository) throw new Error('Repository mismatch')
const repoUrl = `https://api.github.com/repos/${config.repository}`
const gh = (path, options) => api(`${repoUrl}${path}`, githubToken, options)
const figma = (path) => api(`https://api.figma.com/v1${path}`, figmaToken)
const post = (body) => ({ method: 'POST', body: JSON.stringify(body) })
const prefix = 'design/figma/generated/'
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const payload = event.client_payload ?? {}
if (payload.file_key && payload.file_key !== config.fileKey) throw new Error('Figma file mismatch')

// Read pending bot state, including unmerged exports; duplicate delivery is a no-op.
const main = await gh(`/git/ref/heads/${config.baseBranch}`)
const mainCommit = await gh(`/git/commits/${main.object.sha}`)
const oldRef = await gh(`/git/ref/heads/${config.syncBranch}`, { allow404: true })
const oldCommit = oldRef ? await gh(`/git/commits/${oldRef.object.sha}`) : mainCommit
const oldTree = await gh(`/git/trees/${oldCommit.tree.sha}?recursive=1`)
if (oldTree.truncated) throw new Error('GitHub tree was truncated; refusing an incomplete export')
const previousEntries = oldTree.tree.filter(
  (entry) => entry.type === 'blob' && entry.path.startsWith(prefix),
)
async function readPrevious(name) {
  const entry = previousEntries.find((entry) => entry.path === prefix + name)
  if (!entry) return null
  const blob = await gh(`/git/blobs/${entry.sha}`)
  return JSON.parse(Buffer.from(blob.content.replaceAll('\n', ''), 'base64').toString('utf8'))
}
const previous = (await readPrevious('snapshot.json')) ?? { nodes: {} }
const pullPath = `/pulls?state=open&head=${encodeURIComponent(config.repository.split('/')[0] + ':' + config.syncBranch)}`
async function recoverPullRequest() {
  if (!oldRef) return
  const prs = await gh(pullPath)
  if (prs.length) return
  const comparison = await gh(`/compare/${config.baseBranch}...${config.syncBranch}`)
  if (!comparison.files?.length) return // Already merged; do not reopen an empty export.
  const handoff = await readPrevious('handoff.json')
  const pr = await gh(
    '/pulls',
    post({
      title: 'Meridian: approved Figma design exports',
      head: config.syncBranch,
      base: config.baseBranch,
      draft: true,
      body:
        handoff?.body ??
        `Review the pending Meridian export artifacts from https://www.figma.com/design/${config.fileKey}.`,
    }),
  )
  console.log(`Recovered draft export PR: ${pr.html_url}`)
}
const writes = new Map()
const add = (name, content) => writes.set(prefix + name, { content })
let diff = { added: [], changed: [], removed: [] }
let version
let tokensChanged = false
let bundle

if (event.action === 'figma-tokens') {
  bundle = validateTokens(payload.tokens, config)
  if (hash(bundle) === hash(await readPrevious('tokens.json'))) {
    await recoverPullRequest()
    console.log('Token export is unchanged; no PR update needed.')
    process.exit(0)
  }
  tokensChanged = true
  add('tokens.json', json(bundle))
  add('meridian.css', tokenCss(bundle))
} else {
  if (!figmaToken)
    throw new Error('Set the FIGMA_ACCESS_TOKEN repository secret before enabling design sync')
  const requested = payload.version_id || event.inputs?.version_id
  if (requested && !/^[\w-]{1,128}$/.test(requested)) throw new Error('Invalid version ID')
  // Paginate so retries can still locate an older approved version.
  let url = `/files/${config.fileKey}/versions`
  for (let page = 0; page < 20 && url; page++) {
    const result = await figma(url)
    version = result.versions.find(
      (item) => item.label?.trim() && (!requested || item.id === requested),
    )
    if (version) break
    const next = result.pagination?.next_page
    if (next && !next.startsWith(`https://api.figma.com/v1/files/${config.fileKey}/versions?`)) {
      throw new Error('Unexpected pagination URL')
    }
    url = next ? next.replace('https://api.figma.com/v1', '') : null
  }
  if (!version) {
    if (requested) throw new Error('Requested version is not a named Figma version')
    console.log('No named Figma version yet. Save a named version to approve an export.')
    process.exit(0)
  }
  if (previous.versionId === version.id) {
    await recoverPullRequest()
    console.log('This approved Figma version has already been exported.')
    process.exit(0)
  }
  // A delayed event must not rewind a newer pending export.
  if (previous.createdAt && version.created_at <= previous.createdAt) {
    console.log('Ignoring an older approved version.')
    process.exit(0)
  }
  const file = await figma(
    `/files/${config.fileKey}?version=${encodeURIComponent(version.id)}&geometry=paths`,
  )
  const nodes = snapshot(file.document)
  diff = changes(previous.nodes, nodes)
  add(
    'snapshot.json',
    json({ fileKey: config.fileKey, versionId: version.id, createdAt: version.created_at, nodes }),
  )
  add('changes.json', json({ versionId: version.id, label: version.label, ...diff }))
  const validFrames = Object.entries(config.frames).filter(([, id]) => nodes[id])
  const images = await figma(
    `/images/${config.fileKey}?ids=${encodeURIComponent(validFrames.map(([, id]) => id).join(','))}&format=png&scale=1&version=${encodeURIComponent(version.id)}`,
  )
  if (images.err) throw new Error('Figma could not render approved frame previews')
  for (const [name, id] of validFrames) {
    const imageUrl = images.images[id]
    if (!imageUrl || new URL(imageUrl).protocol !== 'https:')
      throw new Error(`Missing preview: ${name}`)
    // No API credentials accompany CDN image requests.
    const result = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) })
    if (!result.ok) throw new Error(`Preview download failed: ${name}`)
    const bytes = Buffer.from(await result.arrayBuffer())
    if (bytes.length > 15_000_000) throw new Error(`Preview exceeds size limit: ${name}`)
    const blob = await gh(
      '/git/blobs',
      post({ encoding: 'base64', content: bytes.toString('base64') }),
    )
    writes.set(`${prefix}previews/${name}.png`, { sha: blob.sha })
  }
}

const title = tokensChanged ? 'Meridian: published token update' : `Meridian: ${version.label}`
const designUrl = `https://www.figma.com/design/${config.fileKey}`
const counts = `${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed layers`
const clean = (value) =>
  String(value)
    .replace(/[\r\n|<>]/g, ' ')
    .slice(0, 120)
const details = [
  ...diff.added.map((node) => ['Added', node]),
  ...diff.changed.map((node) => ['Changed', node]),
  ...diff.removed.map((node) => ['Removed', node]),
]
const lines = details
  .slice(0, 80)
  .map(
    ([kind, node]) =>
      `| ${kind} | ${clean(node.name)} | [${node.id}](${designUrl}?node-id=${encodeURIComponent(node.id)}) |`,
  )
const body = [
  `Source: [Meridian in Figma](${designUrl})${version ? ` · named version ${version.id}` : ' · explicitly published local variables'}.`,
  tokensChanged
    ? 'The designer published a complete Grass/Paper light/dark token export. Generated CSS is a reference artifact; it is not automatically imported into the application.'
    : `${counts}. Previews and layer diffs are exported from the approved named version.`,
  'Review the generated artifacts, adapt relevant semantic tokens/components into a product, and verify desktop/mobile, keyboard focus, contrast and reduced motion before shipping.',
  ...(lines.length
    ? [
        ['| Change | Layer | Figma |', '| --- | --- | --- |', ...lines].join('\n'),
        ...(details.length > 80 ? ['Additional layers are listed in `changes.json`.'] : []),
      ]
    : []),
  'Exports are review artifacts. Continuous refraction, pointer tracking and application behaviour require implementation.',
].join('\n\n')

// Durable issue markers make repeated event delivery idempotent.
const marker = `<!-- meridian-figma:${tokensChanged ? hash(bundle) : version.id} -->`
let existingIssue
for (let page = 1; page <= 20; page++) {
  const issues = await gh(`/issues?state=all&per_page=100&page=${page}`)
  existingIssue = issues.find((issue) => !issue.pull_request && issue.body?.includes(marker))
  if (existingIssue || issues.length < 100) break
}
const issue =
  existingIssue ??
  (await gh('/issues', post({ title: title.slice(0, 200), body: `${marker}\n\n${body}` })))
const prBody = `${body}\n\nLatest design handoff: ${issue.html_url}\n\nThis branch accumulates pending approved exports. Review and merge it to accept the artifacts.`
add('handoff.json', json({ body: prBody, issueUrl: issue.html_url }))

const entries = new Map(
  previousEntries.map((entry) => [
    entry.path,
    { path: entry.path, mode: '100644', type: 'blob', sha: entry.sha },
  ]),
)
for (const [path, value] of writes)
  entries.set(path, { path, mode: '100644', type: 'blob', ...value })
const tree = await gh(
  '/git/trees',
  post({ base_tree: mainCommit.tree.sha, tree: [...entries.values()] }),
)
const parents = [...new Set([oldRef?.object.sha ?? main.object.sha, main.object.sha])]
const commit = await gh(
  '/git/commits',
  post({ message: title.slice(0, 200), tree: tree.sha, parents }),
)
if (oldRef)
  await gh(`/git/refs/heads/${config.syncBranch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  })
else await gh('/git/refs', post({ ref: `refs/heads/${config.syncBranch}`, sha: commit.sha }))

const prs = await gh(pullPath)
let pr
if (prs.length)
  pr = await gh(`/pulls/${prs[0].number}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: 'Meridian: approved Figma design exports', body: prBody }),
  })
else
  pr = await gh(
    '/pulls',
    post({
      title: 'Meridian: approved Figma design exports',
      head: config.syncBranch,
      base: config.baseBranch,
      draft: true,
      body: prBody,
    }),
  )
console.log(`Design issue: ${issue.html_url}\nDraft export PR: ${pr.html_url}`)
