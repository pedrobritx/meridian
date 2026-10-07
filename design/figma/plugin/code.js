/* Local variables are available to plugins on Education plans; no Variables REST API needed. */
figma.showUI(__html__, { width: 440, height: 400 })

figma.ui.onmessage = async (message) => {
  if (message.type !== 'export') return
  try {
    const fileKey = 'aJ2f6aYX9KBucAdPsCmkXn'
    if (figma.fileKey && figma.fileKey !== fileKey)
      throw new Error('Open the configured Meridian file first.')
    const collections = await figma.variables.getLocalVariableCollectionsAsync()
    const variables = await figma.variables.getLocalVariablesAsync()
    const byId = Object.fromEntries(variables.map((variable) => [variable.id, variable]))
    const collectionById = Object.fromEntries(
      collections.map((collection) => [collection.id, collection]),
    )
    const semantic = collections.find((collection) => collection.name === 'Meridian / Colour')
    if (!semantic) throw new Error('This file has no Meridian colour collection.')
    const exported = variables.filter(
      (variable) =>
        collectionById[variable.variableCollectionId]?.name.startsWith('Meridian /') &&
        collectionById[variable.variableCollectionId]?.name !== 'Meridian / Primitives' &&
        ['COLOR', 'FLOAT', 'STRING'].includes(variable.resolvedType),
    )
    function resolve(variable, theme, seen = new Set()) {
      if (!variable) throw new Error('A token refers to an unavailable alias.')
      if (seen.has(variable.id)) throw new Error('A token alias contains a cycle.')
      seen.add(variable.id)
      const collection = collectionById[variable.variableCollectionId]
      let mode =
        collection.modes.find((mode) => mode.name === theme) ??
        collection.modes.find(
          (mode) => mode.name === (theme.startsWith('Paper') ? 'Paper' : 'Grass'),
        )
      if (
        !mode &&
        collection.modes.length === 1 &&
        !['Meridian / Colour', 'Meridian / Layout', 'Meridian / Motion'].includes(collection.name)
      )
        mode = collection.modes[0]
      if (!mode) throw new Error('Missing profile mode in ' + collection.name)
      const value = variable.valuesByMode[mode.modeId]
      if (value?.type === 'VARIABLE_ALIAS') return resolve(byId[value.id], theme, seen)
      return value
    }
    const modes = {}
    for (const theme of ['Dawn', 'Dusk', 'PaperDawn', 'PaperDusk']) {
      modes[theme] = Object.fromEntries(
        exported.map((variable) => [
          variable.name,
          {
            type: variable.resolvedType,
            value: resolve(variable, theme),
          },
        ]),
      )
    }
    figma.ui.postMessage({ type: 'tokens', tokens: { schemaVersion: 1, fileKey, modes } })
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message })
  }
}
