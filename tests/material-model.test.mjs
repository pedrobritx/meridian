import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// The lab page is the single source for its palette: read ENV straight from it.
const html = readFileSync(new URL('../lab/material-model/index.html', import.meta.url), 'utf8');
const envSource = html.match(/const ENV = (\{[\s\S]*?\n\});/);
assert.ok(envSource, 'ENV block found in lab/material-model/index.html');
const ENV = new Function(`return ${envSource[1]};`)();

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = rgb => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(Array.isArray(a) ? a : hex(a)), y = lum(Array.isArray(b) ? b : hex(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (a, b, t) => hex(a).map((v, i) => v * t + hex(b)[i] * (1 - t));

test('six environments, each with Dawn and Dusk and a complete role set', () => {
  assert.deepEqual(Object.keys(ENV), ['prism', 'forest', 'desert', 'ocean', 'aurora', 'canyon']);
  for (const [name, env] of Object.entries(ENV)) {
    for (const mode of ['dawn', 'dusk']) {
      const p = env[mode];
      for (const role of ['surface', 'surface2', 'ink', 'muted', 'accent', 'onAccent', 'accentInk', 'line', 'focus'])
        assert.match(p[role], /^#[0-9A-F]{6}$/i, `${name}/${mode}/${role}`);
      assert.equal(p.ground.length, 3, `${name}/${mode}/ground`);
      assert.ok(p.glass > 0 && p.glass < 1, `${name}/${mode}/glass`);
    }
  }
});

test('text, links, accents, control lines and focus meet their contrast minimums', () => {
  for (const [name, env] of Object.entries(ENV)) {
    for (const mode of ['dawn', 'dusk']) {
      const p = env[mode];
      const pairs = [
        ['body text on surface', p.ink, p.surface, 7],
        ['body text on surface 2', p.ink, p.surface2, 4.5],
        ['muted text on surface', p.muted, p.surface, 4.5],
        ['muted text on surface 2', p.muted, p.surface2, 4.5],
        ['link on surface', p.accentInk, p.surface, 4.5],
        ['label on accent', p.onAccent, p.accent, 4.5],
        ['accent against surface', p.accent, p.surface, 3],
        ['control line against surface', p.line, p.surface, 3],
        ['focus against surface', p.focus, p.surface, 3],
        ...p.ground.map((g, i) => [`focus against ground ${i}`, p.focus, g, 3]),
        // Modelled composite: glass tint over each ground stop must still carry body text.
        ...p.ground.map((g, i) => [`text on glass over ground ${i}`, p.ink, mix(p.surface, g, p.glass), 4.5]),
      ];
      for (const [label, a, b, min] of pairs) {
        const r = ratio(a, b);
        assert.ok(r >= min, `${name}/${mode}: ${label} is ${r.toFixed(2)}:1, needs ${min}:1`);
      }
    }
  }
});

test('the material never uses blend modes (they isolate the group and stop backdrop sampling)', () => {
  assert.doesNotMatch(html, /mix-blend-mode\s*:/);
});

test('physics is defined once and shared by every environment', () => {
  const springs = html.match(/const SPRING = \{[\s\S]*?\n\};/);
  assert.ok(springs, 'SPRING block present');
  for (const env of Object.values(ENV)) {
    for (const key of ['stiffness', 'damping', 'spring', 'duration', 'timing'])
      assert.equal(key in env, false, `environment ${env.name} must not override ${key}`);
  }
});
