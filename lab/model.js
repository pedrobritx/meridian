// Meridian lab model: environments, contexts, inputs, material states and icons.
// Environments, feedback colours and contexts come from the token source; the rest is lab content.
import { tokens } from '../src/tokens.js';

export const ENV = Object.fromEntries(Object.entries(tokens.environments).map(([id, e]) => [id, {
  name: e.name, accent: e.accentName, texture: e.texture, light: e.light.angle,
  frost: e.material.frost, refract: e.material.refract, sheen: e.material.sheen, glyph: e.glyph, note: e.note,
  dawn: e.dawn, dusk: e.dusk,
}]));

/** Feedback colours are shared by every environment so their meaning never changes. */
export const FEEDBACK = tokens.feedback;

/** Inputs: what each gives, how it maps onto the grammar, and what stress it sends the fluid. */
export const INPUT = {
  cursor:     { name: 'Cursor', devices: 'Mouse, trackpad, pointer remote', maps: 'Point by hover; Engage by click; Hold by right-click or long click; Scrub by drag, wheel or two-finger scroll', stress: 'Click duration and drag speed' },
  touch:      { name: 'Touch', devices: 'Fingers on glass', maps: 'Engage by tap; Hold by long press; Scrub by drag or pinch; Back by edge swipe. No Point', stress: 'Contact duration and drag speed; contact size sets the ripple' },
  pencil:     { name: 'Pencil', devices: 'Stylus, pen display', maps: 'Point by hover where supported; Engage by tap; Scrub by stroke', stress: 'Pressure sets dent depth directly; tilt moves the dent' },
  keyboard:   { name: 'Keyboard', devices: 'Physical or on-screen', maps: 'Step by Tab and arrows; Engage by Enter or Space; Hold by the menu key; Back by Escape', stress: 'Key repeat is always firm; holding Space sinks slowly' },
  remote:     { name: 'Remote', devices: 'TV D-pad with OK and Back', maps: 'Step in four directions; Engage by OK; Hold by long OK; Back', stress: 'Repeat rate; held arrows are firm' },
  controller: { name: 'Game controller', devices: 'D-pad, sticks, buttons, triggers', maps: 'Step by D-pad; Scrub by stick; Engage by A; Back by B', stress: 'Trigger travel sets dent depth; stick magnitude sets speed' },
  crown:      { name: 'Crown or knob', devices: 'Watch crown, car rotary knob', maps: 'Step by detents; Scrub by rotation; Engage by press', stress: 'Rotation speed; each detent sends one small ripple' },
  eyes:       { name: 'Eyes', devices: 'Headset gaze', maps: 'Point by looking (the system draws the highlight); Engage with a pinch', stress: 'None: apps never receive gaze' },
  hands:      { name: 'Hands', devices: 'Pinch, direct touch in space', maps: 'Engage by pinch; Hold by pinch and hold; Scrub by pinch and drag', stress: 'Pinch duration and drag speed' },
  gyro:       { name: 'Gyroscope', devices: 'Device tilt and heading', maps: 'Optional and opt-in: steers the key light only', stress: 'None: tilting never presses anything' },
  buttons:    { name: 'Hardware buttons', devices: 'Watch side button, steering-wheel keys', maps: 'Step, Engage and Back by dedicated keys', stress: 'Always firm' },
  voice:      { name: 'Voice', devices: 'Spoken commands', maps: 'Engage and Back by name', stress: 'None: state changes without travel' },
  switch:     { name: 'Switch access', devices: 'One or two accessibility switches', maps: 'Step by scanning (the attention light moves); Engage by switch', stress: "Always firm; scanning speed is the person's setting" },
};

export const INTENTS = ['Point', 'Engage', 'Hold', 'Step', 'Scrub', 'Back'];

export const CTX = Object.fromEntries(Object.entries(tokens.contexts).map(([id, { status, ...c }]) => [id, c]));

/**
 * The material behaviour pattern: how one fluid answers each state.
 * At rest every shape is round (a capsule or a rounded rectangle), held by surface tension;
 * shape changes only while a force acts or the drop moves, then it rounds again.
 * surface: refract/frost/solid/pigment; motion: sink/rebound/wobble/flow/stretch/jiggle;
 * z: elevation change; light: what the light does.
 */
export const STATES = [
  { id: 'rest',     name: 'Rest',      trigger: 'Nothing happening', shape: 'Round and still: a capsule, or a rounded rectangle on the radius scale', surface: 'Tier default', motion: 'Still', z: '3', light: 'Specular rim on the side facing the light', vars: {} },
  { id: 'hover',    name: 'Hover',     trigger: 'Cursor, pencil hover, gaze (drawn by the system)', shape: 'Unchanged; swells about 1%', surface: 'Rim brightens', motion: 'Lifts slightly; does not move sideways', z: '+1.5', light: 'A soft highlight under the pointer', vars: { '--hover': 1, '--px': '64%', '--py': '38%' } },
  { id: 'focus',    name: 'Focus',     trigger: 'Keyboard, remote, knob, controller, switch scanning', shape: 'Unchanged; on TV grows 8%', surface: 'Unchanged', motion: 'The attention light travels and hugs the outline', z: '+2; TV +8', light: 'A calm ring of light', vars: { '--hover': .4 }, focus: true },
  { id: 'pressing', name: 'Pressing',  trigger: 'Contact held', shape: 'Flattens under the contact and spreads sideways, keeping its volume', surface: 'Frost rises under stress', motion: 'Sinks: quick taps barely dent, slow presses sink deep', z: '−75%', light: 'Soft shading at the contact point', vars: { '--press': .85, '--cx': '38%', '--cy': '58%' } },
  { id: 'released', name: 'Activated', trigger: 'Release', shape: 'Rebounds past round, narrowing and rising, then settles', surface: 'Returns to rest', motion: 'Wobbles only after a slow press; a quick tap settles at once', z: 'Returns', light: 'A ring of light leaves the contact point', vars: { '--press': -.3, '--rip-r': 46, '--rip-o': .3, '--cx': '38%', '--cy': '58%' } },
  { id: 'holding',  name: 'Holding',   trigger: 'Contact longer than 0.35 s; fires at about 0.8 s', shape: 'Spreads outward slowly, staying round', surface: 'Frost', motion: 'Slow outward flow until the secondary action is ready', z: 'Rises', light: 'Rim ring in the accent', vars: { '--press': .5, '--creep': 1, '--cx': '50%', '--cy': '50%' } },
  { id: 'selected', name: 'Selected or on', trigger: 'Checked, pressed, current', shape: 'Round and full', surface: 'Pigment infuses from the contact point', motion: 'Colour diffuses once', z: 'Rest', light: 'Soft wash on the pigment', vars: { '--dye': 1 }, selected: true },
  { id: 'off',      name: 'Off or unselected', trigger: 'Unchecked', shape: 'Round', surface: 'Clear glass', motion: 'Still', z: 'Rest', light: 'Key light only', vars: {} },
  { id: 'dragging', name: 'Dragging',  trigger: 'Drag by cursor, finger, pencil, stick', shape: 'Becomes a moving drop: round front, drawn-out tail; firms when very fast', surface: 'Thicker frost', motion: 'Follows the input exactly; the tail flows behind', z: '+8 (lifted)', light: 'Brighter: closer to the light', vars: { '--lift': 1, '--stretch': .1 } },
  { id: 'dropped',  name: 'Dropped',   trigger: 'Release over a target', shape: 'Merges into the target like two droplets, then rounds', surface: 'Rest', motion: 'Flows into place', z: 'Lands', light: 'Rest', vars: { '--lift': .2, '--press': .2 } },
  { id: 'disabled', name: 'Disabled',  trigger: 'Unavailable', shape: 'Round and rigid: the fluid has set and does not deform', surface: 'Flat and matte: no refraction, no sheen', motion: 'Does not yield; a 1 px rigid tick if pressed', z: '0, flush with the ground', light: 'No glow', vars: {}, disabled: true },
  { id: 'error',    name: 'Error',     trigger: 'Invalid input', shape: 'Round; one short jiggle on entering', surface: 'Rim tinted with the error colour', motion: 'Jiggles once, then still', z: 'Rest', light: 'Error rim, plus icon and text', vars: {}, error: true },
  { id: 'busy',     name: 'Busy',      trigger: 'Work in progress', shape: 'Round', surface: 'Rest', motion: 'Slow internal flow while busy; static text with reduced motion', z: 'Rest', light: 'A band of light flows through', vars: {}, busy: true },
  { id: 'success',  name: 'Success',   trigger: 'Work finished', shape: 'One gentle swell, then round', surface: 'Brief brightening', motion: 'One gentle swell', z: '+1, then rest', light: 'Glow fades', vars: { '--hover': .6, '--dye': .5 }, selected: true },
];

/**
 * Icons on a 24 grid: subjects from nature, calm geometry. d: strokes (round caps and joins);
 * fill: the closed area takes the duotone tint. Stroke weight comes from CSS so one drawing serves every weight.
 */
export const ICONS = {
  back:     { name: 'Back', d: 'M14.5 5.5 8 12l6.5 6.5' },
  play:     { name: 'Play', d: 'M8.5 6.2v11.6a1 1 0 0 0 1.53.85l9.18-5.8a1 1 0 0 0 0-1.7L10.03 5.35A1 1 0 0 0 8.5 6.2z', fill: true },
  pause:    { name: 'Pause', d: 'M8 5.5h1.5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z M14.5 5.5H16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z', fill: true },
  prev:     { name: 'Previous', d: 'M18 6.7v10.6a.9.9 0 0 1-1.42.73L9.3 12.73a.9.9 0 0 1 0-1.46l7.28-5.3A.9.9 0 0 1 18 6.7z M6 6v12', fill: true },
  next:     { name: 'Next', d: 'M6 6.7v10.6a.9.9 0 0 0 1.42.73l7.28-5.3a.9.9 0 0 0 0-1.46L7.42 5.97A.9.9 0 0 0 6 6.7z M18 6v12', fill: true },
  bookmark: { name: 'Bookmark', d: 'M8.5 4h7A1.5 1.5 0 0 1 17 5.5v13.1a.8.8 0 0 1-1.27.65L12 16.5l-3.73 2.75A.8.8 0 0 1 7 18.6V5.5A1.5 1.5 0 0 1 8.5 4z', fill: true },
  share:    { name: 'Share', d: 'M12 3.8v10.4 M8.3 7.3 12 3.8l3.7 3.5 M8 10H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1' },
  textsize: { name: 'Text size', d: 'M3.5 18.5 8.5 5.5l5 13 M5.3 14h6.4 M19.5 12.5v6 M17 13a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z' },
  close:    { name: 'Close', d: 'M6.5 6.5l11 11 M17.5 6.5l-11 11' },
  search:   { name: 'Search', d: 'M10.5 4.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12z M15 15l4.5 4.5', fill: true },
  sliders:  { name: 'Adjust', d: 'M4.5 8h15 M4.5 16h15 M9 5.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z M15 13.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z', fill: true },
  home:     { name: 'Home', d: 'M4.5 11 12 4.5l7.5 6.5 M6.5 9.5V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V9.5 M10 19.5v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4' },
  heart:    { name: 'Favourite', d: 'M12 19.5s-7.5-4.6-7.5-10A4.1 4.1 0 0 1 12 7.2a4.1 4.1 0 0 1 7.5 2.3c0 5.4-7.5 10-7.5 10z', fill: true },
  sun:      { name: 'Dawn', d: 'M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z M12 3.5v1.8 M12 18.7v1.8 M3.5 12h1.8 M18.7 12h1.8 M6 6l1.3 1.3 M16.7 16.7 18 18 M6 18l1.3-1.3 M16.7 7.3 18 6', fill: true },
  moon:     { name: 'Dusk', d: 'M19 14.6A7.5 7.5 0 1 1 9.4 5a7 7 0 0 0 9.6 9.6z', fill: true },
  prism:    { name: 'Prism', d: 'M12 5.2 18.6 17H5.4z M2.5 13.4 8.7 11.8 M15.3 11.6l6.2-2 M15.8 12.8l5.7 1', fill: true },
  leaf:     { name: 'Forest', d: 'M5.5 18.5C5.5 10.5 10.5 5.5 18.5 5.5c0 8-5 13-13 13z M5.5 18.5 13 11', fill: true },
  dunes:    { name: 'Desert', d: 'M3 16.5c2.5-3.3 5-5 7.5-5s4.5 1.6 6.5 4 M9 19c3-2.9 6-4.2 9-4 1 .1 2 .4 3 .9 M17.5 5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', fill: true },
  wave:     { name: 'Ocean', d: 'M3 14c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0 M3 18c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0 M7.5 10a4.5 4.5 0 0 1 9 0' },
  aurora:   { name: 'Aurora', d: 'M6 5c-1.5 2.3 1.5 4.7 0 7s1.5 4.7 0 7 M10 4c-1.5 2.5 1.5 5 0 7.5s1.5 5 0 7.5 M14 4.5c-1.5 2.4 1.5 4.8 0 7.2s1.5 4.8 0 7.2 M18 5.5c-1.3 2.1 1.3 4.2 0 6.3s1.3 4.2 0 6.3' },
  mesa:     { name: 'Canyon', d: 'M3 19h18 M5 19l2.4-6.5a.8.8 0 0 1 .75-.5h3.1l1.4-4.4a.8.8 0 0 1 .76-.6h2.3a.8.8 0 0 1 .77.6L19 19' },
  alert:    { name: 'Alert', d: 'M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z M12 8.3v4.6 M12 15.7v.1', fill: true },
  check:    { name: 'Done', d: 'M5.5 12.5l4 4 9-9' },
};
