/**
 * Optional native maintenance handoff. Import into a plugin; never runs on import.
 * First call with { apply: false }. Current live assets are indexed in the refactor map.
 */
export const LIQUID_GLASS_FILE_KEY = 'aJ2f6aYX9KBucAdPsCmkXn';

export const LIQUID_GLASS_TIERS = Object.freeze({
  rear: { dawn: 0.32, dusk: 0.42, radius: 16, depth: 12 },
  raised: { dawn: 0.48, dusk: 0.56, radius: 32, depth: 24 },
  navigation: { dawn: 0.40, dusk: 0.49, radius: 24, depth: 18 },
  menu: { dawn: 0.56, dusk: 0.63, radius: 40, depth: 30 },
  dialog: { dawn: 0.56, dusk: 0.63, radius: 40, depth: 30 },
  selection: { dawn: 0.56, dusk: 0.64, radius: 32, depth: 24 },
});

const clone = (value) => JSON.parse(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const archiveName = /\barchiv(?:e|ed)\b/i;
const layerName = /^(?:(.+)\/)?color\/material\/layer\/(rear|raised|navigation|menu|dialog|selection)$/;
const properties = ['fills', 'strokes', 'effects', 'opacity', 'cornerRadius',
  'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius',
  'cornerSmoothing', 'strokeWeight', 'description'];

function descendants(node) {
  return [node, ...Array.from(node.children || []).flatMap(descendants)];
}

function names(node) {
  const result = [];
  for (let n = node; n && n.type !== 'DOCUMENT'; n = n.parent) result.push(n.name || '');
  return result;
}

function isArchived(node) {
  return names(node).some((name) => archiveName.test(name));
}

function sourceState(node, mixed) {
  const state = {};
  for (const key of properties) {
    if (!(key in node)) continue;
    const value = node[key];
    if (value !== undefined && value !== mixed) state[key] = clone(value);
  }
  // Geometry, prototype wiring and semantic bindings are verification invariants.
  for (const key of ['width', 'height', 'x', 'y', 'reactions', 'boundVariables']) {
    if (key in node && node[key] !== undefined && node[key] !== mixed) state[key] = clone(node[key]);
  }
  return state;
}

function variableValue(variable, modeId, variables, collections, seen = new Set()) {
  if (seen.has(variable.id)) throw Error('Cyclic material variable alias: ' + variable.name);
  const collection = collections.get(variable.variableCollectionId);
  const value = variable.valuesByMode[modeId] ?? variable.valuesByMode[collection?.defaultModeId];
  if (!value) throw Error('Unresolved material variable: ' + variable.name);
  if (value.type !== 'VARIABLE_ALIAS') return value;
  const next = variables.get(value.id);
  if (!next) throw Error('Missing native material alias: ' + value.id);
  return variableValue(next, modeId, variables, collections, new Set([...seen, variable.id]));
}

function resolveColor(variable, node, variables, collections) {
  if (typeof variable.resolveForConsumer === 'function') {
    const result = variable.resolveForConsumer(node);
    if (result.resolvedType !== 'COLOR') throw Error('Expected COLOR binding: ' + variable.name);
    return clone(result.value);
  }
  const collection = collections.get(variable.variableCollectionId);
  const modeId = node.resolvedVariableModes?.[collection.id] || collection.defaultModeId;
  return clone(variableValue(variable, modeId, variables, collections));
}

function resolvedPaints(paints, node, variables, collections) {
  return paints.map((paint) => {
    if (paint.type !== 'SOLID' || !paint.boundVariables?.color) return clone(paint);
    const variable = variables.get(paint.boundVariables.color.id);
    if (!variable) throw Error('Archive preservation guard: missing paint variable ' + paint.boundVariables.color.id);
    const color = resolveColor(variable, node, variables, collections);
    if (!['r', 'g', 'b'].every((key) => Number.isFinite(color[key]))) {
      throw Error('Archive preservation guard: unresolved native COLOR on ' + node.name);
    }
    const result = clone(paint);
    result.color = { r: color.r, g: color.g, b: color.b };
    // Native bound COLOR alpha is already reflected in the paint opacity;
    // multiplying both would accidentally darken the Archive snapshot.
    result.opacity = paint.opacity ?? color.a ?? 1;
    delete result.boundVariables;
    return result;
  });
}

function resolvedState(node, mixed, variables, collections) {
  const state = sourceState(node, mixed);
  for (const key of ['fills', 'strokes']) {
    if (state[key]) state[key] = resolvedPaints(state[key], node, variables, collections);
  }
  if (state.effects) state.effects = state.effects.map((effect) => {
    if (!effect.boundVariables?.color) return effect;
    const variable = variables.get(effect.boundVariables.color.id);
    if (!variable) throw Error('Archive preservation guard: missing effect variable on ' + node.id);
    const value = resolveColor(variable, node, variables, collections);
    const resolved = { ...effect, color: { ...value, a: effect.color?.a ?? value.a ?? 1 } };
    delete resolved.boundVariables;
    return resolved;
  });
  delete state.boundVariables;
  return state;
}

function materialRole(node, variables) {
  if (!['FRAME', 'COMPONENT', 'INSTANCE', 'RECTANGLE', 'ELLIPSE'].includes(node.type)) return null;
  const own = node.name || '';
  const context = names(node).join(' / ');
  if (/\b(opaque|reduced transparency|high contrast|disabled|error|loading)\b/i.test(context)) return null;
  // Preserve documentation wrappers; the named functional specimen inside is
  // the actual control. A Specimen / Menu layer is still a material surface.
  if (/\b(examples?|atlas|gallery|documentation|comparison|canvas)\b/i.test(own)) return null;
  if (/^(?:Universal\s*\/|.*\b(?:variant|state)\s*=)/i.test(own) &&
    node.children?.some((child) => /^Specimen\s*\//i.test(child.name))) return null;
  if (/\bspecimens?\b/i.test(own) && !/^Specimen\s*\//i.test(own)) return null;
  const knob = /\b(knob|thumb|handle)\b/i.test(own) && /\b(slider|range|switch|toggle)\b/i.test(context);
  if (knob) return /\b(pressed|dragging|active|focus|hover)\b/i.test(context) ? 'selection' : 'raised';
  const classify = (name) => /\b(dialog|modal)\b/i.test(name) ? 'dialog' :
    /\b(menu|popover|sheet|drawer|tooltip)\b/i.test(name) ? 'menu' :
      /\b(toolbar|sidebar|tab ?bar|tabbar|navdock|bottom navigation|navigation|header)\b/i.test(name) ? 'navigation' :
        /\b(button|icon button|segment|chip|control)\b/i.test(name) ? 'raised' : null;
  let role = classify(own.replace(/^Specimen\s*\/\s*/i, ''));
  const familySurface = /\b(variant|state)\s*=|^Specimen\s*\/|\b(background|surface|container|material)\b/i.test(own);
  const toolbarGroup = /\b(group|cluster)\b/i.test(own) && /\btoolbar\b/i.test(node.parent?.name || '');
  if (!role && (familySurface || toolbarGroup)) {
    for (let ancestor = node.parent; ancestor && ancestor.type !== 'PAGE'; ancestor = ancestor.parent) {
      role = classify(ancestor.name || '');
      if (role) break;
    }
  }
  if (!role && Array.isArray(node.effects) && node.effects.some((effect) => effect.type === 'GLASS')) role = 'rear';
  if (!role) return null;
  // Focus is not the same as selection; preserve separate focus-ring semantics.
  const ownState = own.replace(/\bSelected\s*=\s*[^,]+/gi, '');
  let selected = /\b(selected|checked|current)\b/i.test(ownState) && !/\b(unselected|unchecked)\b/i.test(ownState);
  const paintVariable = node.fills?.find?.((paint) => paint.boundVariables?.color);
  if (paintVariable && variables?.get(paintVariable.boundVariables.color.id)?.name.endsWith('/material/layer/selection')) selected = true;
  if (!selected && /\b(segment|tab|item)\b/i.test(own)) {
    for (let ancestor = node.parent; ancestor && ancestor.type !== 'PAGE'; ancestor = ancestor.parent) {
      const value = ancestor.name?.match(/\bSelected\s*=\s*([^,]+)/i)?.[1]?.trim();
      if (!value) continue;
      selected = own.split(/[\/,:]/).some((part) => part.trim().toLowerCase() === value.toLowerCase());
      break;
    }
  }
  if (selected) role = 'selection';
  return role;
}

function chosenVariable(node, suffix, variables, preferredCollection) {
  const current = Array.isArray(node.fills) ? node.fills.find((paint) => paint.boundVariables?.color) : null;
  const bound = current && variables.get(current.boundVariables.color.id);
  const prefix = bound?.name.match(/^([^/]+)\/color\//)?.[1];
  const candidates = [...variables.values()].filter((variable) => variable.resolvedType === 'COLOR' &&
    (variable.name === suffix || (prefix && variable.name === prefix + '/' + suffix)));
  return candidates.find((variable) => variable.variableCollectionId === preferredCollection?.id && variable.name === suffix) ||
    candidates.find((variable) => prefix && variable.name === prefix + '/' + suffix) ||
    candidates.find((variable) => variable.name === suffix);
}

function glassEffects(node, role) {
  const tier = LIQUID_GLASS_TIERS[role];
  const existing = Array.isArray(node.effects) ? clone(node.effects) : [];
  const glass = existing.find((effect) => effect.type === 'GLASS') || {};
  let radius = Math.max(tier.radius, typeof glass.radius === 'number' ? glass.radius : 0);
  for (let ancestor = node.parent; ancestor && ancestor.type !== 'PAGE'; ancestor = ancestor.parent) {
    const parentGlass = Array.isArray(ancestor.effects) && ancestor.effects.find((effect) => effect.type === 'GLASS' && effect.visible !== false);
    if (!parentGlass) continue;
    radius = Math.max(radius, parentGlass.radius + 8);
    break;
  }
  const effects = existing.filter((effect) => !['GLASS', 'BACKGROUND_BLUR'].includes(effect.type));
  effects.unshift({ ...glass, type: 'GLASS', visible: true, radius,
    refraction: 0.07, depth: tier.depth, lightAngle: 135, lightIntensity: 0.20, dispersion: 0 });
  // Retain existing shadows and add missing physical cues. Do not flatten depth.
  if (!effects.some((effect) => effect.type === 'INNER_SHADOW')) {
    effects.push({ type: 'INNER_SHADOW', visible: true, blendMode: 'NORMAL',
      color: { r: 1, g: 1, b: 1, a: 0.12 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0 });
  }
  const drops = effects.filter((effect) => effect.type === 'DROP_SHADOW').length;
  if (drops < 1) effects.push({ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL',
    color: { r: 0.025, g: 0.035, b: 0.07, a: 0.12 }, offset: { x: 0, y: 2 }, radius: 5, spread: 0 });
  if (drops < 2) effects.push({ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL',
    color: { r: 0.025, g: 0.035, b: 0.07, a: 0.10 }, offset: { x: 0, y: 10 }, radius: 28, spread: -3 });
  return effects;
}

async function loadFonts(figma, nodes) {
  const fonts = new Map();
  for (const node of nodes.filter((node) => node.type === 'TEXT')) {
    const segments = node.getStyledTextSegments(['fontName']);
    if (!segments.length) segments.push({ fontName: node.fontName });
    for (const { fontName } of segments) {
      if (!fontName || fontName === figma.mixed) throw Error('Resolve missing font before glass handoff: ' + node.id);
      fonts.set(fontName.family + '/' + fontName.style, fontName);
    }
  }
  for (const font of fonts.values()) await figma.loadFontAsync(font);
}

function restoreNode(node, state) {
  for (const key of properties) if (key in state && !same(node[key], state[key])) node[key] = clone(state[key]);
}

/**
 * Native plugin API only. loadAllPagesAsync loads the complete document once;
 * Existing geometry and prototype wiring are never rewritten. One optional
 * standalone XL wrapper is created on the discovered Actions source page.
 * Returns every mutated node ID. dry-run is the default.
 */
export async function revampLiquidGlass(figma, { apply = false } = {}) {
  if (figma.fileKey !== LIQUID_GLASS_FILE_KEY) throw Error('Liquid Glass handoff is restricted to the Meridian Figma file.');
  if (typeof figma.loadAllPagesAsync !== 'function') throw Error('Use a native plugin runtime with loadAllPagesAsync; canvas handoff has not run.');
  await figma.loadAllPagesAsync();
  const collectionsArray = await figma.variables.getLocalVariableCollectionsAsync();
  const variablesArray = await figma.variables.getLocalVariablesAsync();
  const collections = new Map(collectionsArray.map((collection) => [collection.id, collection]));
  const variables = new Map(variablesArray.map((variable) => [variable.id, variable]));
  const semanticPaint = (node, variable, previous = {}) => {
    const color = resolveColor(variable, node, variables, collections);
    return figma.variables.setBoundVariableForPaint({ ...clone(previous), type: 'SOLID',
      color: { r: color.r, g: color.g, b: color.b }, opacity: color.a ?? 1 }, 'color', variable);
  };
  const preferredCollection = collectionsArray.find((collection) => collection.name === 'Meridian / Environment') ||
    collectionsArray.find((collection) => collection.name === 'Meridian / Living Environments · 0.6');
  if (!preferredCollection) throw Error('No native Meridian Environment collection found; no write made.');
  const nodes = figma.root.children.flatMap(descendants).filter((node) => node.type !== 'PAGE');
  const archives = nodes.filter(isArchived);
  if (!figma.root.children.some((page) => archiveName.test(page.name)) && !archives.length) {
    throw Error('Archive preservation guard: Archive native-source snapshot unavailable; no write made.');
  }
  const archiveSnapshots = archives.map((node) => ({ node, source: sourceState(node, figma.mixed),
    appearance: resolvedState(node, figma.mixed, variables, collections) }));
  const cells = [];
  for (const variable of variablesArray) {
    const match = variable.name.match(layerName);
    if (!match || variable.resolvedType !== 'COLOR') continue;
    const collection = collections.get(variable.variableCollectionId);
    for (const mode of collection.modes) {
      const before = variable.valuesByMode[mode.modeId];
      if (!before || before.type === 'VARIABLE_ALIAS') continue; // Preserve Environment → Appearance aliases.
      if (!['r', 'g', 'b'].every((key) => Number.isFinite(before[key]))) throw Error('Invalid material RGBA: ' + variable.name);
      const dusk = /dusk|dark/i.test(mode.name);
      const tier = LIQUID_GLASS_TIERS[match[2]];
      const after = { ...before, a: dusk ? tier.dusk : tier.dawn };
      if (match[2] === 'selection') {
        const sunken = variablesArray.find((candidate) => candidate.name === (match[1] ? match[1] + '/' : '') + 'color/bg/sunken' &&
          candidate.variableCollectionId === variable.variableCollectionId);
        if (!sunken) throw Error('Selection requires its existing sunken token; no write made.');
        const color = variableValue(sunken, mode.modeId, variables, collections);
        Object.assign(after, { r: color.r, g: color.g, b: color.b });
      }
      if (!same(before, after)) cells.push({ variable, modeId: mode.modeId, before: clone(before), after });
    }
  }
  const toolbarContainers = nodes.filter((node) => !isArchived(node) && materialRole(node, variables) && 'fills' in node && /\btoolbar\b/i.test(node.name) &&
    node.children?.some((child) => /\b(group|cluster)\b/i.test(child.name) && ['FRAME', 'COMPONENT', 'INSTANCE'].includes(child.type)));
  const surfaces = nodes.filter((node) => !isArchived(node) && !toolbarContainers.includes(node)).map((node) => ({ node, role: materialRole(node, variables) }))
    .filter(({ node, role }) => role && Array.isArray(node.fills) && node.fills.length &&
      node.fills.some((paint) => paint.type === 'SOLID' && paint.visible !== false));
  const missing = [];
  for (const surface of surfaces) {
    surface.variable = chosenVariable(surface.node, 'color/material/layer/' + surface.role, variables, preferredCollection);
    if (!surface.variable) missing.push(surface.node.name + ': color/material/layer/' + surface.role);
  }
  if (missing.length) throw Error('Missing existing semantic material roles; no write made: ' + missing.slice(0, 12).join('; '));
  const xl = nodes.filter((node) => !isArchived(node) && node.type === 'COMPONENT' && /\bsize\s*=\s*(xl|extra.large)\b/i.test(node.name));
  const existingXL = nodes.find((node) => !isArchived(node) && node.type === 'COMPONENT' && node.name === 'Button / Liquid XL');
  const buttonSet = nodes.find((node) => !isArchived(node) && node.type === 'COMPONENT_SET' && /^Button(?: \/ Glass)?$/.test(node.name));
  const primary = buttonSet?.children.find((node) => node.type === 'COMPONENT' &&
    Object.values(node.variantProperties || {}).includes('Primary') && node.variantProperties?.State === 'Default');
  const xlPage = figma.root.children.find((page) => !archiveName.test(page.name) && /Actions & Buttons|Core Component Masters|^Components$/i.test(page.name));
  const canCreateXL = !existingXL && xl.length === 0 && primary && xlPage &&
    typeof primary.createInstance === 'function' && typeof figma.createComponent === 'function' &&
    typeof figma.setCurrentPageAsync === 'function';
  const report = { applied: false, pageCount: figma.root.children.length,
    archivedNodeCount: archives.length, surfaceCount: surfaces.length, variableCellCount: cells.length,
    xlVariantIds: [...xl.map((node) => node.id), ...(existingXL ? [existingXL.id] : [])],
    xlCreationPrepared: Boolean(canCreateXL), toolbarGroupContainerIds: toolbarContainers.map((node) => node.id),
    createdNodeIds: [], mutatedNodeIds: [],
    limitations: ['Runtime overlap/focus adaptation and morphing are not established by static Figma styling.',
      'Readability over actual content in all ten Environments, in Dawn and Dusk, requires native rendered review.',
      'Toolbar groups retain existing structure; unrelated actions require visual grouping review.',
      ...(xl.length || existingXL || canCreateXL ? [] : ['No canonical Primary/Default button or Actions source page discovered; XL creation needs review.'])] };
  if (!apply) return report;
  const before = new Map(nodes.map((node) => [node.id, sourceState(node, figma.mixed)]));
  const variableBaseline = variablesArray.map((variable) => ({ id: variable.id, values: clone(variable.valuesByMode) }));
  if (canCreateXL) await figma.setCurrentPageAsync(xlPage);
  await loadFonts(figma, nodes);
  if (!same(figma.root.children.flatMap(descendants).filter((node) => node.type !== 'PAGE').map((node) => node.id), nodes.map((node) => node.id)) ||
    nodes.some((node) => !same(sourceState(node, figma.mixed), before.get(node.id))) ||
    !same(variablesArray.map((variable) => ({ id: variable.id, values: variable.valuesByMode })), variableBaseline)) {
    throw Error('Figma changed during font preparation; no write made.');
  }
  const touched = new Set();
  const created = [];
  let createdWrapper;
  try {
    // Pin resolved Archive paints before shared token/source mutation. This is
    // the only place semantic bindings may become literal: historical fidelity.
    for (const { node, appearance } of archiveSnapshots) {
      for (const key of ['fills', 'strokes']) if (appearance[key] && !same(node[key], appearance[key])) {
        node[key] = clone(appearance[key]); touched.add(node.id);
      }
    }
    for (const cell of cells) cell.variable.setValueForMode(cell.modeId, cell.after);
    // Existing named toolbar groups share their own glass surfaces. Clearing
    // only their parent chrome avoids tinting the same content twice; child
    // grouping and all action positions stay intact.
    for (const node of toolbarContainers) {
      for (const key of ['fills', 'strokes', 'effects']) if (Array.isArray(node[key]) && node[key].length) {
        node[key] = []; touched.add(node.id);
      }
    }
    for (const { node, role, variable } of surfaces) {
      const existing = node.fills.find((paint) => paint.type === 'SOLID') || { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
      const paint = semanticPaint(node, variable, existing);
      const fills = [paint]; // One semantic tint: stacked opaque layers mask the environment.
      const effects = glassEffects(node, role);
      if (!same(node.effects, effects)) { node.effects = effects; touched.add(node.id); }
      // Native GLASS assignment can normalize fallback opacity. Apply the
      // resolved semantic paint afterward so the preview retains translucency.
      if (!same(node.fills, fills)) { node.fills = fills; touched.add(node.id); }
      if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) {
        const radius = Math.max(node.cornerRadius, Math.min(node.height / 2, role === 'navigation' ? 24 : 20));
        if (node.cornerRadius !== radius) { node.cornerRadius = radius; touched.add(node.id); }
      }
      // A half-pixel semantic edge accompanies the optical highlight; focus
      // rings retain their established width and binding.
      if ('strokeWeight' in node && typeof node.strokeWeight === 'number' && !/\bfocus(?:ed)?\b/i.test(names(node).join('/'))) {
        const weight = Math.min(node.strokeWeight, 0.5);
        if (node.strokeWeight !== weight) { node.strokeWeight = weight; touched.add(node.id); }
      }
      if (node.type === 'COMPONENT') {
        const rule = 'Liquid Glass: ' + role + ' functional layer; environment-bound translucency, rounded optical highlight and retained contact/elevation shadows. Preserve label contrast, focus and opaque accessibility variants.';
        const description = (node.description || '').split('\nLiquid Glass:')[0] + '\n' + rule;
        if (node.description !== description) { node.description = description; touched.add(node.id); }
      }
      {
        const foreground = role === 'selection' ?
          chosenVariable(node, 'color/material/selection/foreground', variables, preferredCollection) ||
            chosenVariable(node, 'color/text/primary', variables, preferredCollection) :
          chosenVariable(node, 'color/text/primary', variables, preferredCollection);
        for (const text of descendants(node).filter((child) => child.type === 'TEXT')) {
          const old = Array.isArray(text.fills) && text.fills.find((paint) => paint.type === 'SOLID');
          if (!old) continue;
          const oldRole = old.boundVariables?.color && variables.get(old.boundVariables.color.id)?.name;
          const inverse = /color\/action\/on-primary$/.test(oldRole || '');
          const selectedLabel = role === 'selection' &&
            (/color\/text\/(primary|secondary|tertiary)$/.test(oldRole || '') || (!oldRole && /\blabel\b/i.test(text.name)));
          if (!inverse && !selectedLabel) continue;
          if (!foreground) throw Error('Glass labels require native primary-text semantics: ' + node.name);
          const foregroundPaint = semanticPaint(text, foreground, old);
          if (!same(text.fills, [foregroundPaint])) { text.fills = [foregroundPaint]; touched.add(text.id); }
        }
      }
    }
    if (canCreateXL) {
      // A separate wrapper preserves every existing variant axis, master ID,
      // child property binding, icon source and prototype destination.
      const wrapper = figma.createComponent();
      createdWrapper = wrapper; created.push(wrapper.id);
      wrapper.name = 'Button / Liquid XL';
      const instance = primary.createInstance();
      wrapper.appendChild(instance);
      created.push(...descendants(instance).map((node) => node.id));
      const width = Math.max(144, instance.width + 48);
      const height = Math.max(64, instance.height + 16);
      wrapper.resize(width, height);
      wrapper.layoutMode = 'HORIZONTAL';
      wrapper.primaryAxisSizingMode = 'AUTO'; wrapper.counterAxisSizingMode = 'AUTO';
      wrapper.primaryAxisAlignItems = 'CENTER'; wrapper.counterAxisAlignItems = 'CENTER';
      wrapper.paddingLeft = 24; wrapper.paddingRight = 24;
      wrapper.paddingTop = 8; wrapper.paddingBottom = 8; wrapper.minHeight = 64;
      wrapper.cornerRadius = height / 2; wrapper.cornerSmoothing = 0.65;
      const material = chosenVariable(primary, 'color/material/layer/raised', variables, preferredCollection);
      if (!material) throw Error('XL requires the existing raised material semantic role.');
      wrapper.fills = [semanticPaint(wrapper, material)];
      wrapper.strokes = []; wrapper.effects = glassEffects(wrapper, 'raised');
      wrapper.description = 'Standalone XL option: minimum 64px height, 24px horizontal padding, capsule curvature. The linked Primary/Default button owns labels, icons and prototype actions.\nLiquid Glass: raised functional layer; environment-bound translucency, rounded optical highlight and retained contact/elevation shadows. Preserve label contrast, focus and opaque accessibility variants.';
      const right = Math.max(0, ...xlPage.children.filter((node) => node !== wrapper).map((node) => node.x + node.width));
      wrapper.x = right + 96; wrapper.y = 80;
    }
    // Archive instances can inherit changed master optics despite the pre-pin.
    // Reapply the complete captured optical state and compare resolved output.
    for (const { node, appearance } of archiveSnapshots) {
      const state = resolvedState(node, figma.mixed, variables, collections);
      if (!same(state, appearance)) { restoreNode(node, appearance); touched.add(node.id); }
      if (!same(resolvedState(node, figma.mixed, variables, collections), appearance)) {
        throw Error('Archive preservation guard: visual/prototype source changed on ' + node.id);
      }
    }
    for (const node of nodes.filter((node) => !isArchived(node))) {
      const original = before.get(node.id);
      for (const key of ['width', 'height', 'x', 'y', 'reactions']) {
        if (key in original && !same(node[key], original[key])) throw Error('Unexpected geometry/prototype change: ' + node.id);
      }
    }
    return { ...report, applied: true, archiveAppearancePreserved: true,
      createdNodeIds: created, xlVariantIds: createdWrapper ? [createdWrapper.id] : report.xlVariantIds,
      mutatedNodeIds: [...touched], mutatedVariableIds: [...new Set(cells.map((cell) => cell.variable.id))] };
  } catch (error) {
    const rollbackErrors = [];
    if (createdWrapper) {
      try { createdWrapper.remove(); } catch (failure) { rollbackErrors.push('XL wrapper: ' + failure); }
    }
    for (const cell of cells) {
      try { cell.variable.setValueForMode(cell.modeId, cell.before); } catch (failure) { rollbackErrors.push(String(failure)); }
    }
    for (const node of nodes) {
      try { restoreNode(node, before.get(node.id)); } catch (failure) { rollbackErrors.push(node.id + ': ' + failure); }
    }
    throw Error('Liquid Glass handoff failed and ' + (rollbackErrors.length ? 'rollback needs attention: ' + rollbackErrors.join('; ') : 'was rolled back') + '. ' + error.message);
  }
}
