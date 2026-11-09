// Foundation checks for Meridian 1.0. A value that fails here cannot ship as stable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildCSS, buildModule, environmentVars } from '../scripts/generate.mjs';
import { contrast, composite } from '../src/contrast.js';
import { FEEL, FEEL_SETTLE, feelSpring, settleTime, reboundSpring } from '../src/fluid.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(root + path, 'utf8');
const tokens = JSON.parse(read('tokens/meridian.tokens.json'));
const css = read('css/meridian.css');
const envs = Object.entries(tokens.environments);
const appearances = ['dawn', 'dusk'];
const HEX = /^#[0-9A-F]{6}$/i;
const COLOURS = ['surface', 'surface2', 'ink', 'muted', 'accent', 'onAccent', 'accentInk', 'line', 'focus'];

test('generated files match the token source', () => {
  assert.equal(css, buildCSS(tokens), 'css/meridian.css is stale: run npm run build');
  assert.equal(read('src/tokens.js'), buildModule(tokens), 'src/tokens.js is stale: run npm run build');
});

test('six environments, each with complete Dawn and Dusk palettes', () => {
  assert.deepEqual(Object.keys(tokens.environments), ['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon']);
  for (const [id, e] of envs) {
    for (const a of appearances) {
      for (const k of COLOURS) assert.match(e[a][k], HEX, `${id}.${a}.${k}`);
      assert.equal(e[a].ground.length, 3, `${id}.${a}.ground`);
      e[a].ground.forEach(g => assert.match(g, HEX));
      assert.ok(e[a].glass > 0 && e[a].glass < tokens.material.maxGlassAlpha, `${id}.${a}.glass`);
    }
  }
});

test('text meets WCAG AA (4.5:1) on every surface it sits on', () => {
  for (const [id, e] of envs) for (const a of appearances) {
    const p = e[a];
    const error = tokens.feedback[a].error;
    const pairs = { ink: [p.ink, p.surface], muted: [p.muted, p.surface], accentInk: [p.accentInk, p.surface], onAccent: [p.onAccent, p.accent], error: [error, p.surface] };
    for (const [name, [fg, bg]] of Object.entries(pairs)) {
      const r = contrast(fg, bg);
      assert.ok(r >= 4.5, `${id} ${a} ${name}: ${r.toFixed(2)}:1`);
    }
    for (const g of p.ground) {
      for (const [name, fg] of Object.entries({ ink: p.ink, muted: p.muted })) {
        assert.ok(contrast(fg, g) >= 4.5, `${id} ${a} ${name} on ground ${g}`);
        // Text on glass: the glass at its resting alpha over the ground, before blur brightens it.
        const onGlass = contrast(fg, composite(p.surface, p.glass, g));
        assert.ok(onGlass >= 4.5, `${id} ${a} ${name} on glass over ${g}: ${onGlass.toFixed(2)}:1`);
      }
    }
  }
});

test('focus rings and control edges meet 3:1', () => {
  for (const [id, e] of envs) for (const a of appearances) {
    const p = e[a];
    for (const bg of [p.surface, ...p.ground]) {
      assert.ok(contrast(p.focus, bg) >= 3, `${id} ${a} focus on ${bg}`);
    }
    assert.ok(contrast(p.line, p.surface) >= 3, `${id} ${a} line on surface`);
  }
});

test('feedback colours mean the same thing in every environment', () => {
  for (const [id] of envs) for (const a of appearances) {
    assert.equal(environmentVars(tokens, id, a)['--error'], tokens.feedback[a].error);
  }
});

test('every glass surface has an opaque solid fallback', () => {
  for (const [id, e] of envs) for (const a of appearances) {
    assert.match(e[a].surface, HEX, `${id} ${a} surface must be opaque`);
    assert.equal(environmentVars(tokens, id, a)['--glass-rgb'].split(' ').length, 3, 'glass colour is the surface colour without alpha');
  }
  for (const query of ['@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))', '@media (prefers-reduced-transparency: reduce)', '[data-tier="solid"]']) {
    const at = css.indexOf(query);
    assert.ok(at >= 0, `missing ${query}`);
    const rule = css.slice(at, css.indexOf('}', at));
    assert.match(rule, /--glass-a: 1;/, `${query} must make glass opaque`);
    assert.match(rule, /--frost: 0px;/, `${query} must remove frost`);
  }
});

test('reduced motion makes every transition instant', () => {
  for (const query of ['@media (prefers-reduced-motion: reduce)', '[data-motion="reduced"]']) {
    const at = css.indexOf(query);
    assert.ok(at >= 0, `missing ${query}`);
    const rule = css.slice(at, css.indexOf('}', at));
    for (const k of Object.keys(tokens.motion.duration)) assert.match(rule, new RegExp(`--dur-${k}: 0ms;`), `${query} --dur-${k}`);
  }
});

test('every environment feel settles within the shared time, so outcomes never depend on the environment', () => {
  assert.equal(FEEL_SETTLE, 0.9);
  for (const [id, f] of Object.entries(FEEL)) {
    for (const depth of [0.2, 0.6, 1]) for (const firm of [0, 1]) {
      const base = reboundSpring(depth, firm);
      const s = feelSpring({ k: base.k, zeta: base.zeta }, f);
      assert.ok(s.zeta >= 0.3 && s.zeta <= 1, `${id} damping ${s.zeta}`);
      const t = settleTime(s) + (f.linger || 0);
      assert.ok(t <= FEEL_SETTLE, `${id} depth ${depth} firm ${firm} settles in ${t.toFixed(3)} s`);
    }
  }
});

test('no blend modes anywhere', () => {
  for (const path of ['css/meridian.css', 'lab/index.html']) {
    assert.doesNotMatch(read(path), /(mix|background)-blend-mode/, path);
  }
});

test('refraction stays within its budget', () => {
  for (const [id, c] of Object.entries(tokens.contexts)) {
    assert.ok(c.refractBudget >= 0 && c.refractBudget <= 4, `${id} refract budget ${c.refractBudget}`);
    if (c.tierCap !== 'refract') assert.equal(c.refractBudget, 0, `${id} caps at ${c.tierCap}, so nothing may refract`);
    assert.ok(tokens.material.tiers.includes(c.tierCap), `${id} tier cap`);
  }
  for (const [id, e] of envs) assert.ok(e.material.refract <= 32, `${id} refraction ${e.material.refract}px`);
});

test('targets: 48 px wherever touch is the main input, and Desk grows to 48 px on coarse pointers', () => {
  for (const [id, c] of Object.entries(tokens.contexts)) {
    if (!c.hover) assert.ok(c.target >= 48, `${id} target ${c.target}`);
    assert.ok(c.target >= 40, `${id} target ${c.target}`);
  }
  const coarse = css.slice(css.indexOf('@media (any-pointer: coarse)'));
  assert.match(coarse, /--target: 48px;/);
});

test('only Desk and Touch are built for the web; the other contexts stay written specs', () => {
  const web = Object.entries(tokens.contexts).filter(([, c]) => c.status === 'web').map(([id]) => id);
  assert.deepEqual(web, ['desk', 'touch']);
  for (const id of ['wrist', 'space', 'tv', 'drive']) assert.doesNotMatch(css, new RegExp(`data-context="${id}"`));
});
