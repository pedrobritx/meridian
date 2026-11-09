// Reference page controls: environment, appearance, context, tier and motion.
// Query parameters (?env=ocean&appearance=dusk&context=touch&tier=solid&motion=reduced) win over saved choices.
import { enhance, refresh } from '../src/material.js';

const root = document.documentElement;
const KEYS = ['env', 'appearance', 'context', 'tier', 'motion'];
const params = new URLSearchParams(location.search);

const load = () => { try { return JSON.parse(localStorage.getItem('meridian-reference') || '{}'); } catch { return {}; } };
const save = s => { try { localStorage.setItem('meridian-reference', JSON.stringify(s)); } catch { /* storage unavailable */ } };

const state = { env: 'prism', appearance: 'system', context: 'desk', tier: 'frost', motion: 'system', ...load() };
for (const k of KEYS) if (params.has(k)) state[k] = params.get(k);

function apply() {
  root.dataset.env = state.env;
  root.dataset.context = state.context;
  root.dataset.tier = state.tier;
  if (state.appearance === 'system') delete root.dataset.appearance; else root.dataset.appearance = state.appearance;
  if (state.motion === 'system') delete root.dataset.motion; else root.dataset.motion = state.motion;
  for (const k of KEYS) {
    const input = document.querySelector(`input[name="ref-${k}"][value="${state[k]}"]`);
    if (input) input.checked = true;
  }
}

apply();
enhance(document);

document.querySelector('#settings').addEventListener('change', e => {
  const k = e.target.name?.replace('ref-', '');
  if (!KEYS.includes(k)) return;
  state[k] = e.target.value; save(state); apply();
  requestAnimationFrame(() => refresh(document));
});

// Toggle buttons in the examples.
document.querySelectorAll('[aria-pressed]').forEach(b => b.addEventListener('click', () => {
  if (b.disabled) return;
  b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
}));

// A busy example that finishes.
const busy = document.querySelector('#busy-demo');
busy?.addEventListener('click', () => {
  if (busy.getAttribute('aria-busy') === 'true') return;
  const label = busy.querySelector('.m-label');
  busy.setAttribute('aria-busy', 'true'); label.textContent = 'Saving…';
  setTimeout(() => { busy.removeAttribute('aria-busy'); label.textContent = 'Saved'; setTimeout(() => { label.textContent = 'Save'; }, 1400); }, 1800);
});

// Slider readout.
const size = document.querySelector('#text-size'), sizeOut = document.querySelector('#text-size-out');
size?.addEventListener('input', () => { sizeOut.textContent = `${size.value} px`; });

// Indeterminate checkbox example.
const mixed = document.querySelector('#mixed');
if (mixed) mixed.indeterminate = true;

// Field validation: the error appears on submit and clears as soon as there is a title.
const form = document.querySelector('#note-form');
const title = document.querySelector('#note-title'), titleMsg = document.querySelector('#note-title-msg');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const empty = !title.value.trim();
  if (empty) { title.setAttribute('aria-invalid', 'true'); titleMsg.hidden = false; title.focus(); }
  else { title.removeAttribute('aria-invalid'); titleMsg.hidden = true; }
});
title?.addEventListener('input', () => { if (title.value.trim()) { title.removeAttribute('aria-invalid'); titleMsg.hidden = true; } });
