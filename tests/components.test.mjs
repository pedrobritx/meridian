// Static checks for css/components.css. The browser checks are in tests/browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(root + 'css/components.css', 'utf8');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

test('components take colours only from tokens', () => {
  const allowed = new Set(['#000', '#fff']);   // mask fills and the lit thumb
  const forcedColours = code.slice(code.indexOf('@media (forced-colors: active)'));
  // The iridescent rim's spectrum is the one place literal colours are allowed; its own test follows.
  const body = code.slice(0, code.indexOf('@media (forced-colors: active)')).replace(/conic-gradient\([^;]*\);/, '');
  for (const hex of body.match(/#[0-9a-f]{3,8}\b/gi) || []) assert.ok(allowed.has(hex.toLowerCase()), `raw colour ${hex}`);
  for (const fn of body.match(/\b(?:rgb|hsl)a?\(\s*\d[^)]*\)/gi) || []) assert.fail(`raw colour ${fn}`);
  assert.ok(forcedColours.includes('ButtonText'), 'forced colours use system colours');
});

test('the spectrum rim appears only on primary buttons in Prism', () => {
  const rules = code.split('}').filter(r => r.includes('conic-gradient'));
  assert.equal(rules.length, 1);
  assert.match(rules[0], /\[data-env="prism"\]\) button\.m-pigment/);
});

test('no blend modes', () => {
  assert.doesNotMatch(css, /(mix|background)-blend-mode/);
});

test('every interactive component shows a focus ring', () => {
  for (const sel of ['.m-mat:focus-visible', '.m-seg-opt:has(input:focus-visible)', '.m-switch:has(input:focus-visible)']) {
    const at = code.indexOf(sel);
    assert.ok(at >= 0, `missing ${sel}`);
    assert.match(code.slice(at, code.indexOf('}', at)), /outline: 2px solid var\(--focus\)/, sel);
  }
});

test('targets come from the context token', () => {
  const rule = sel => { const at = code.indexOf(`${sel} {`); assert.ok(at >= 0, sel); return code.slice(at, code.indexOf('}', at)); };
  assert.match(rule('.m-mat'), /min-height: var\(--target\)/);
  assert.match(rule('.m-mat'), /min-width: var\(--target\)/);
  assert.match(rule('.m-seg-opt'), /min-height: var\(--target\)/);
  assert.match(rule('.m-switch'), /min-height: var\(--target\)/);
});

test('looping motion stops with reduced motion, from the system or the page', () => {
  const system = code.slice(code.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(system, /animation: none/);
  assert.match(code, /\[data-motion="reduced"\] \.m-mat\[aria-busy="true"\] > \.m-body > \.m-light \{ animation: none; \}/);
});

test('components sit in the Meridian cascade layer', () => {
  assert.match(code, /^\s*@layer meridian\.components \{/);
});
