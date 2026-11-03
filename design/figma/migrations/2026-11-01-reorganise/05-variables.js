// Step 5 (no page switch): Figma fixes F1 and F2 from docs/migration/2026-11-01-phase-1-drift.md.
// F1: give motion/duration/contact its own 80 ms primitive instead of the feedback alias it
//     shares with hover. F2: Aurora Dawn link default #59639c -> #475486 and link hover
//     #475486 -> #3f4a80 (existing Aurora action hover and active colours). Safe to retry.
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const primitives = collections.find(c => c.name === 'Meridian / Primitives');
const motion = collections.find(c => c.name === 'Meridian / Motion');
const feedback = await figma.variables.getVariableByIdAsync('VariableID:383:1848');
const contact = await figma.variables.getVariableByIdAsync('VariableID:42:99');
if (!primitives || !motion || !feedback || !contact) throw Error('Expected collections or variables missing');
const name = 'optics/motion/liquid/duration/contact';
const all = await figma.variables.getLocalVariablesAsync('FLOAT');
let primitive = all.find(v => v.name === name && v.variableCollectionId === primitives.id);
if (!primitive) {
  primitive = figma.variables.createVariable(name, primitives, 'FLOAT');
  primitive.scopes = feedback.scopes;
  primitive.hiddenFromPublishing = feedback.hiddenFromPublishing;
  primitive.description = 'Contact feedback. Governance: immediate contact, at or below 100 ms.';
}
primitive.setValueForMode(primitives.defaultModeId, 80);
for (const mode of motion.modes) contact.setValueForMode(mode.modeId, figma.variables.createVariableAlias(primitive));
const hex = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a: 1 });
const linkDefault = await figma.variables.getVariableByIdAsync('VariableID:507:3118');
const linkHover = await figma.variables.getVariableByIdAsync('VariableID:507:3119');
if (linkDefault?.name !== 'liquid-glass/aurora/color/link/default/dawn' || linkHover?.name !== 'liquid-glass/aurora/color/link/hover/dawn') throw Error('Aurora link primitives changed');
const mode = primitives.defaultModeId;
linkDefault.setValueForMode(mode, hex('#475486'));
linkHover.setValueForMode(mode, hex('#3f4a80'));
return { primitive: primitive.id, contact: contact.id, modes: motion.modes.length, aurora: [linkDefault.id, linkHover.id] };
