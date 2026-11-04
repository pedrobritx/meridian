import assert from 'node:assert/strict';
import test from 'node:test';
import { LIQUID_GLASS_FILE_KEY, LIQUID_GLASS_TIERS, revampLiquidGlass } from '../../design/figma/liquid-glass-revamp.js';

const clone = (value) => structuredClone(value);

function fixture() {
  const collections = [{ id: 'environment', name: 'Meridian / Environment', defaultModeId: 'aurora',
    modes: [{ modeId: 'aurora', name: 'Aurora' }] },
  { id: 'appearance', name: 'Meridian / Appearance', defaultModeId: 'dawn',
    modes: [{ modeId: 'dawn', name: 'Dawn' }, { modeId: 'dusk', name: 'Dusk' }] }];
  const variables = [];
  const resolve = (variable) => {
    const value = variable.valuesByMode[variable.variableCollectionId === 'environment' ? 'aurora' : 'dawn'];
    return value.type === 'VARIABLE_ALIAS' ? resolve(variables.find((v) => v.id === value.id)) : value;
  };
  function variable(id, name, collection, values) {
    const v = { id, name, resolvedType: 'COLOR', variableCollectionId: collection, valuesByMode: clone(values),
      setValueForMode(mode, value) { this.valuesByMode[mode] = clone(value); },
      resolveForConsumer() { return { resolvedType: 'COLOR', value: clone(resolve(this)) }; } };
    variables.push(v); return v;
  }
  for (const role of Object.keys(LIQUID_GLASS_TIERS)) {
    const id = 'aurora-' + role;
    variable(id, 'aurora/color/material/layer/' + role, 'appearance', {
      dawn: { r: 0.93, g: 0.95, b: 1, a: 0.88 }, dusk: { r: 0.06, g: 0.08, b: 0.17, a: 0.94 },
    });
    variable(role, 'color/material/layer/' + role, 'environment', { aurora: { type: 'VARIABLE_ALIAS', id } });
  }
  variable('sunken', 'aurora/color/bg/sunken', 'appearance', {
    dawn: { r: 0.906, g: 0.922, b: 0.976, a: 1 }, dusk: { r: 0.047, g: 0.063, b: 0.145, a: 1 },
  });
  variable('text', 'color/text/primary', 'environment', { aurora: { r: 0.05, g: 0.06, b: 0.12, a: 1 } });
  variable('onAction', 'color/action/on-primary', 'environment', { aurora: { r: 1, g: 1, b: 1, a: 1 } });
  let next = 0;
  const optical = ['fills', 'strokes', 'effects', 'cornerRadius', 'strokeWeight', 'opacity'];
  const defaultPaint = { type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 };
  function node(type, name, parent, main = null) {
    const own = {};
    const n = { id: String(++next), type, name, parent, children: [], x: 0, y: 0, width: 180, height: 48,
      reactions: [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'URL', url: 'https://example.test' }] }],
      appendChild(child) { if (child.parent) child.parent.children = child.parent.children.filter((sibling) => sibling !== child);
        child.parent = this; this.children.push(child); },
      resize(width, height) { this.width = width; this.height = height; },
      remove() { this.parent.children = this.parent.children.filter((child) => child !== this); this.removed = true; } };
    for (const key of optical) {
      Object.defineProperty(n, key, { enumerable: true, configurable: true,
        get() {
          const value = key in own ? own[key] : main ? main[key] :
            key === 'fills' ? [defaultPaint] : key === 'strokes' || key === 'effects' ? [] : key === 'cornerRadius' ? 12 : 1;
          if (key !== 'fills' && key !== 'strokes') return clone(value);
          return value.map((paint) => {
            const color = paint.boundVariables?.color && resolve(variables.find((v) => v.id === paint.boundVariables.color.id));
            return color ? { ...clone(paint), color: { r: color.r, g: color.g, b: color.b }, opacity: color.a ?? 1 } : clone(paint);
          });
        }, set(value) { own[key] = clone(value); } });
    }
    if (type === 'COMPONENT') n.description = 'Existing usage contract';
    if (type === 'TEXT') {
      n.fontName = { family: 'Manrope', style: 'Regular' };
      n.getStyledTextSegments = () => [{ fontName: n.fontName }];
    }
    if (parent) parent.children.push(n);
    return n;
  }
  const root = { type: 'DOCUMENT', children: [] };
  const active = node('PAGE', '13 · Sources · Core Component Masters', root);
  const archive = node('PAGE', '92 · Research · Forest Archive', root);
  const toolbar = node('COMPONENT', 'Toolbar', active);
  toolbar.fills = [{ ...defaultPaint, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'navigation' } } }];
  toolbar.effects = [{ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL', color: { r: 0, g: 0, b: 0, a: 0.14 }, offset: { x: 0, y: 4 }, radius: 14, spread: 0 }];
  toolbar.strokes = [{ ...defaultPaint, opacity: 0.15 }];
  const archivedToolbar = node('INSTANCE', 'Toolbar', archive, toolbar);
  const selected = node('COMPONENT', 'Segment / Selected', active);
  const label = node('TEXT', 'Label', selected);
  label.fills = [{ ...defaultPaint, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'onAction' } } }];
  const slider = node('FRAME', 'Slider / Pressed', active);
  const knob = node('ELLIPSE', 'Knob', slider);
  const opaque = node('COMPONENT', 'Button / Opaque', active);
  const card = node('FRAME', 'Content card', active);
  const image = node('FRAME', 'Navigation artwork', active);
  image.fills = [{ type: 'IMAGE', imageHash: 'unchanged', scaleMode: 'FILL' }];
  const fonts = [];
  const figma = { fileKey: LIQUID_GLASS_FILE_KEY, root, mixed: Symbol('mixed'),
    loadAllPagesAsync: async () => {}, loadFontAsync: async (font) => fonts.push(font),
    setCurrentPageAsync: async (page) => { figma.currentPage = page; },
    createComponent: () => node('COMPONENT', '', figma.currentPage || active),
    variables: { getLocalVariableCollectionsAsync: async () => collections,
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint(paint, field, v) { return { ...clone(paint), boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } }; } } };
  const visible = (n) => Object.fromEntries(optical.map((key) => [key, n[key]]));
  return { figma, nodes: { active, archive, toolbar, archivedToolbar, selected, label, slider, knob, opaque, card, image },
    variables, fonts, visible, node };
}

test('dry-run discovers material surfaces without changing the native source', async () => {
  const f = fixture();
  const before = f.visible(f.nodes.toolbar);
  const tokens = clone(f.variables.map((v) => v.valuesByMode));
  const report = await revampLiquidGlass(f.figma);
  assert.equal(report.applied, false);
  assert.ok(report.surfaceCount >= 3);
  assert.deepEqual(f.visible(f.nodes.toolbar), before);
  assert.deepEqual(f.variables.map((v) => v.valuesByMode), tokens);
  assert.deepEqual(report.mutatedNodeIds, []);
});

test('more translucent layers retain depth, cool Aurora, labels, aliases and exact Archive appearance', async () => {
  const f = fixture();
  f.nodes.selected.effects = [{ type: 'GLASS', visible: true, radius: 68, refraction: 0.07,
    depth: 26, lightAngle: 135, lightIntensity: 0.20, dispersion: 0 }];
  const before = f.visible(f.nodes.archivedToolbar);
  const oldOpaque = f.visible(f.nodes.opaque);
  const oldCard = f.visible(f.nodes.card);
  const oldImage = f.visible(f.nodes.image);
  const wire = clone(f.nodes.toolbar.reactions);
  const report = await revampLiquidGlass(f.figma, { apply: true });
  assert.equal(report.archiveAppearancePreserved, true);
  assert.deepEqual(f.visible(f.nodes.archivedToolbar), { ...before,
    fills: before.fills.map(({ boundVariables, ...paint }) => paint) });
  assert.equal(f.nodes.toolbar.fills[0].opacity, 0.40);
  assert.ok(f.nodes.toolbar.effects.some((effect) => effect.type === 'GLASS'));
  assert.ok(f.nodes.toolbar.effects.filter((effect) => effect.type === 'DROP_SHADOW').length >= 2);
  assert.ok(f.nodes.toolbar.effects.some((effect) => effect.type === 'INNER_SHADOW'));
  assert.ok(f.nodes.toolbar.cornerRadius >= 20);
  assert.equal(f.nodes.knob.fills[0].boundVariables.color.id, 'selection');
  assert.ok(f.nodes.knob.effects.find((effect) => effect.type === 'GLASS').radius >= 32, 'the interacting knob retains protective frosting');
  assert.equal(f.nodes.selected.effects.find((effect) => effect.type === 'GLASS').radius, 68, 'existing foreground frost is never reduced');
  assert.equal(f.nodes.label.fills[0].boundVariables.color.id, 'text');
  assert.equal(f.variables.find((v) => v.id === 'navigation').valuesByMode.aurora.type, 'VARIABLE_ALIAS');
  const selection = f.variables.find((v) => v.id === 'aurora-selection').valuesByMode.dawn;
  assert.equal(selection.a, 0.56);
  assert.equal(selection.b, 0.976);
  assert.ok(selection.b > selection.g && selection.g > selection.r, 'Aurora selection is cool lavender, never green');
  assert.deepEqual(f.visible(f.nodes.opaque), oldOpaque);
  assert.deepEqual(f.visible(f.nodes.card), oldCard);
  assert.deepEqual(f.visible(f.nodes.image), oldImage);
  assert.deepEqual(f.nodes.toolbar.reactions, wire);
  assert.ok(f.fonts.length > 0);
  const again = await revampLiquidGlass(f.figma, { apply: true });
  assert.equal(again.variableCellCount, 0);
  assert.deepEqual(again.mutatedNodeIds, []);
});

test('Archive snapshot and missing semantic-role guards fail before any write', async () => {
  const f = fixture();
  f.nodes.archive.name = 'Unclassified research';
  await assert.rejects(revampLiquidGlass(f.figma, { apply: true }), /Archive native-source snapshot unavailable/);
  const g = fixture();
  g.variables.splice(g.variables.findIndex((v) => v.id === 'selection'), 1);
  const before = g.visible(g.nodes.toolbar);
  await assert.rejects(revampLiquidGlass(g.figma, { apply: true }), /missing paint variable|Missing existing semantic material roles/i);
  assert.deepEqual(g.visible(g.nodes.toolbar), before);
});

test('a failed active-surface write rolls back shared tokens and Archive overrides', async () => {
  const f = fixture();
  const before = f.visible(f.nodes.archivedToolbar);
  const tokens = clone(f.variables.map((v) => v.valuesByMode));
  const descriptor = Object.getOwnPropertyDescriptor(f.nodes.selected, 'effects');
  let failOnce = true;
  Object.defineProperty(f.nodes.selected, 'effects', { ...descriptor, set(value) {
    if (failOnce) { failOnce = false; throw Error('Injected native effect write failure'); }
    descriptor.set.call(this, value);
  } });
  await assert.rejects(revampLiquidGlass(f.figma, { apply: true }), /was rolled back.*Injected native effect write failure/);
  assert.deepEqual(f.variables.map((v) => v.valuesByMode), tokens);
  assert.deepEqual(f.visible(f.nodes.archivedToolbar), before);
});

test('XL is a standalone linked capsule, keeps existing variant axes and is created once', async () => {
  const f = fixture();
  const set = f.node('COMPONENT_SET', 'Button', f.nodes.active);
  const primary = f.node('COMPONENT', 'Variant=Primary, State=Default', set);
  primary.variantProperties = { Variant: 'Primary', State: 'Default' };
  primary.createInstance = () => f.node('INSTANCE', primary.name, null, primary);
  const axes = clone(primary.variantProperties);
  const report = await revampLiquidGlass(f.figma, { apply: true });
  assert.ok(report.createdNodeIds.length >= 2);
  const wrapper = f.nodes.active.children.find((n) => n.name === 'Button / Liquid XL');
  assert.equal(wrapper.minHeight, 64);
  assert.equal(wrapper.paddingLeft, 24);
  assert.equal(wrapper.cornerRadius, wrapper.height / 2);
  assert.equal(wrapper.children[0].type, 'INSTANCE');
  assert.deepEqual(primary.variantProperties, axes);
  const again = await revampLiquidGlass(f.figma, { apply: true });
  assert.deepEqual(again.createdNodeIds, []);
  assert.equal(f.nodes.active.children.filter((n) => n.name === 'Button / Liquid XL').length, 1);
});

test('family variants and functional specimens inherit navigation while selection stays with the chosen sibling', async () => {
  const f = fixture();
  const header = f.node('COMPONENT_SET', 'Header', f.nodes.active);
  const headerVariant = f.node('COMPONENT', 'State=Default', header);
  const navdock = f.node('COMPONENT_SET', 'Navdock', f.nodes.active);
  const dockVariant = f.node('COMPONENT', 'State=Collapsed', navdock);
  const menu = f.node('COMPONENT_SET', 'Menu', f.nodes.active);
  const docWrapper = f.node('COMPONENT', 'State=Default', menu);
  const specimen = f.node('FRAME', 'Specimen / menu-list', docWrapper);
  const segmented = f.node('FRAME', 'Segmented control / Selected=Overview', f.nodes.active);
  const chosen = f.node('FRAME', 'Segment / Overview', segmented);
  const sibling = f.node('FRAME', 'Segment / Details', segmented);
  const sheet = f.node('FRAME', 'Sheet', f.nodes.active);
  const foreground = f.node('FRAME', 'Segment / Selected', sheet);
  const originalWrapper = f.visible(docWrapper);
  await revampLiquidGlass(f.figma, { apply: true });
  assert.equal(headerVariant.fills[0].boundVariables.color.id, 'navigation');
  assert.equal(dockVariant.fills[0].boundVariables.color.id, 'navigation');
  assert.equal(specimen.fills[0].boundVariables.color.id, 'menu');
  assert.deepEqual(f.visible(docWrapper), originalWrapper);
  assert.equal(chosen.fills[0].boundVariables.color.id, 'selection');
  assert.equal(sibling.fills[0].boundVariables.color.id, 'raised');
  assert.equal(sheet.effects.find((effect) => effect.type === 'GLASS').radius, 40);
  assert.ok(foreground.effects.find((effect) => effect.type === 'GLASS').radius > sheet.effects.find((effect) => effect.type === 'GLASS').radius, 'a selected lens above menu glass advances the frost layer');
});

test('existing toolbar groups share local glass while opaque toolbar fallbacks remain intact', async () => {
  const f = fixture();
  const actions = f.node('FRAME', 'Group / Actions', f.nodes.toolbar);
  const view = f.node('FRAME', 'Group / View', f.nodes.toolbar);
  const opaque = f.node('FRAME', 'Toolbar / Opaque', f.nodes.active);
  f.node('FRAME', 'Group / Actions', opaque);
  const before = f.visible(opaque);
  const positions = [clone(actions.x), clone(view.x)];
  const report = await revampLiquidGlass(f.figma, { apply: true });
  assert.deepEqual(report.toolbarGroupContainerIds, [f.nodes.toolbar.id]);
  assert.deepEqual(f.nodes.toolbar.fills, []);
  assert.equal(actions.fills[0].boundVariables.color.id, 'navigation');
  assert.equal(view.fills[0].boundVariables.color.id, 'navigation');
  assert.deepEqual([actions.x, view.x], positions);
  assert.deepEqual(f.visible(opaque), before);
});

test('selected lenses retain semantic foreground while quiet glass uses primary text', async () => {
  const f = fixture();
  const environment = (await f.figma.variables.getLocalVariableCollectionsAsync())[0];
  environment.modes[0].name = 'Forest';
  for (const v of f.variables) if (v.name.startsWith('aurora/')) v.name = v.name.replace('aurora/', 'forest/');
  const layer = f.variables.find((v) => v.id === 'aurora-selection');
  layer.valuesByMode.dawn = { r: 0.13, g: 0.35, b: 0.29, a: 0.88 };
  const white = f.nodes.label.fills[0];
  const toolbarLabel = f.node('TEXT', 'Label', f.nodes.toolbar);
  toolbarLabel.fills = [white];
  const foreground = { ...f.variables.find((v) => v.id === 'selection'), id: 'selection-foreground',
    name: 'color/material/selection/foreground', valuesByMode: { aurora: { type: 'VARIABLE_ALIAS', id: 'text' } } };
  f.variables.push(foreground);
  await revampLiquidGlass(f.figma, { apply: true });
  assert.equal(layer.valuesByMode.dawn.a, 0.56);
  assert.equal(layer.valuesByMode.dusk.a, 0.64);
  assert.equal(f.nodes.label.fills[0].boundVariables.color.id, 'selection-foreground');
  assert.equal(toolbarLabel.fills[0].boundVariables.color.id, 'text');
});

test('a concurrent native edit during font preparation stops without overwriting that edit', async () => {
  const f = fixture();
  f.figma.loadFontAsync = async () => { f.nodes.toolbar.cornerRadius = 17; };
  const tokens = clone(f.variables.map((v) => v.valuesByMode));
  await assert.rejects(revampLiquidGlass(f.figma, { apply: true }), /changed during font preparation; no write made/);
  assert.equal(f.nodes.toolbar.cornerRadius, 17);
  assert.deepEqual(f.variables.map((v) => v.valuesByMode), tokens);
});
