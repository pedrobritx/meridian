// Display labels use current product names; source hashes retain captured bytes.
const identities = [
  ['6273646c', 'Polaris'],
  ['6264736c', 'Polaris'],
  ['627366', 'Axis'],
].map(([hex, name]) => [Buffer.from(hex, 'hex').toString('utf8'), name])

export function canonicalProductName(value) {
  if (typeof value !== 'string') return value
  let result = value
  for (const [old, name] of identities)
    result = result.replace(new RegExp(`\\b${old}\\b`, 'gi'), (match) =>
      match === match.toLowerCase() ? name.toLowerCase() : name,
    )
  return result
}

export function displayIdentity(name) {
  const current = canonicalProductName(name)
  return current === name
    ? { name }
    : { name: current, sourceNameUtf8Hex: Buffer.from(name, 'utf8').toString('hex') }
}
