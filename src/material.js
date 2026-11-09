// Meridian material behaviour: the fluid answers pointer, touch, pencil and keys.
// enhance(root) wires every component inside root and is safe to call again after the DOM changes.
// Behaviour follows the Material Lab; timing and outcomes are the same in every environment,
// only how a press gives and recovers follows the environment's feel.
import { tokens } from './tokens.js';
import { FLUID, FEEL, clamp, depthAfter, firmnessFromInterval, reboundSpring, feelSpring } from './fluid.js';

const SPRING = tokens.motion.springs;
const media = q => (typeof matchMedia === 'function' ? matchMedia(q) : { matches: false });
const motionQuery = media('(prefers-reduced-motion: reduce)');
const hoverQuery = media('(hover: hover)');

/** Reduced motion: data-motion="reduced" or "full" on the root wins; otherwise the system setting. */
export function reducedMotion() {
  const set = document.documentElement.dataset.motion;
  if (set === 'reduced') return true;
  if (set === 'full') return false;
  return motionQuery.matches;
}

/** The feel of the environment an element sits in. */
export function feelOf(el) {
  const env = el.closest('[data-env]')?.dataset.env;
  return FEEL[env] || FEEL[tokens.defaults.environment];
}

/* ---------- Engine: springs and waves, running only while something moves ---------- */
const active = new Set();
let raf = 0, last = 0;
function loop(t) {
  const dt = Math.min(Math.max((t - last) / 1000, 0), 1 / 30); last = t;
  for (const a of active) if (a.step(dt)) active.delete(a);
  raf = active.size ? requestAnimationFrame(loop) : 0;
}
function wake(a) { active.add(a); if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

export class Spring {
  constructor(value, cfg, onUpdate) { this.x = value; this.v = 0; this.target = value; this.cfg = cfg; this.onUpdate = onUpdate; }
  to(target, cfg, v0) {
    if (cfg) this.cfg = cfg;
    if (v0 !== undefined) this.v = v0;
    this.target = target;
    if (reducedMotion()) { this.jump(target); return; }
    wake(this);
  }
  jump(value) { this.x = this.target = value; this.v = 0; active.delete(this); this.onUpdate(value, 0); }
  step(dt) {
    const { k, c } = this.cfg; const n = Math.max(1, Math.ceil(dt * 240)); const h = dt / n;
    for (let i = 0; i < n; i++) { const a = -k * (this.x - this.target) - c * this.v; this.v += a * h; this.x += this.v * h; }
    const scale = Math.max(1, Math.abs(this.target));
    const done = Math.abs(this.x - this.target) < 0.001 * scale && Math.abs(this.v) < 0.01 * scale;
    if (done) { this.x = this.target; this.v = 0; }
    this.onUpdate(this.x, this.v);
    return done;
  }
}

class Ripple {
  constructor(el) { this.el = el; this.t = 1; }
  start(maxR, strength = 1) { if (reducedMotion()) return; this.maxR = maxR; this.s = strength; this.t = 0; wake(this); }
  step(dt) {
    this.t = Math.min(1, this.t + dt / 0.56); const e = 1 - Math.pow(1 - this.t, 3);
    this.el.style.setProperty('--rip-r', (e * this.maxR).toFixed(1));
    this.el.style.setProperty('--rip-o', (Math.pow(1 - this.t, 2) * 0.42 * this.s).toFixed(3));
    return this.t >= 1;
  }
}

/* ---------- Shape: round at rest; a moving drop keeps a round front and draws out a tail ---------- */
const shapeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(es => es.forEach(e => applyShape(e.target, true))) : null;
function shapeOf(el) { el._flow = el._flow || { k: 0, dir: 1, round: 0, moving: false }; shapeObserver?.observe(el); applyShape(el); }
function setFlow(el, f) { if (!el._flow) return; Object.assign(el._flow, f); applyShape(el); }
function applyShape(el, measure) {
  const f = el._flow; if (!f) return; const W = el.offsetWidth, H = el.offsetHeight; if (!W || !H) return;
  if (!f.moving && (measure || el._base == null)) { el.style.borderRadius = ''; el._base = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, W / 2, H / 2); }
  const k = clamp(f.k), rnd = clamp(f.round), base = el._base ?? Math.min(W, H) / 2;
  const R = base + (Math.min(W, H) / 2 - base) * rnd * .6;
  let tail = R * (1 + .9 * k), lead = R;
  if (tail + lead > W) { lead = Math.max(R * .5, W - tail); tail = W - lead; }
  const ry = Math.min(R, H / 2), T = { x: +tail.toFixed(1), y: +ry.toFixed(1) }, F = { x: +lead.toFixed(1), y: +ry.toFixed(1) };
  const r = f.dir >= 0 ? [T, F, F, T] : [F, T, T, F];
  f.moving = k > .002 || rnd > .002;
  el.style.borderRadius = f.moving ? `${r[0].x}px ${r[1].x}px ${r[2].x}px ${r[3].x}px / ${r[0].y}px ${r[1].y}px ${r[2].y}px ${r[3].y}px` : '';
}

/** Adds the material's body (refraction and light layers) if the markup does not already have it. */
export function addBody(el) {
  if (!el.querySelector(':scope > .m-body')) {
    const b = document.createElement('span'); b.className = 'm-body'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = '<span class="m-refract"></span><span class="m-light"></span>';
    el.prepend(b);
  }
  if (!el._flow) shapeOf(el);
}

/* ---------- The fluid: shear-thickening contact ---------- */
let lastContact = -1;
function rapidFirmness() {
  const now = performance.now() / 1000; const f = lastContact < 0 ? 0 : firmnessFromInterval(now - lastContact);
  lastContact = now; return f;
}
const isDisabled = el => el.disabled || el.getAttribute('aria-disabled') === 'true' || el.matches(':has(input:disabled)');

function fluid(el) {
  const rip = new Ripple(el);
  let d = 0, creep = 0, t0 = 0, firm = 0, pressure = 1, holding = false, fired = false, rebound = null, creepSpring = null, feel = FEEL.prism;
  const set = () => {
    el.style.setProperty('--press', d.toFixed(3)); el.style.setProperty('--creep', creep.toFixed(3));
    if (el._flow && !el.disabled) setFlow(el, { round: clamp(d) * .5 + creep * .5 });
  };
  const creepAnim = { step() {
    const t = performance.now() / 1000 - t0;
    d = depthAfter(t, Math.min(1.15, pressure * feel.depth), firm, { creepTau: FLUID.creepTau * feel.creep, depthCapFirm: FLUID.depthCapFirm });
    if (t > FLUID.holdAfter && el.dataset.hold !== undefined) creep = 1 - Math.exp(-(t - FLUID.holdAfter) / FLUID.holdTau);
    if (creep > FLUID.holdFire && !fired) { fired = true; el.dispatchEvent(new CustomEvent('fluidhold', { bubbles: true })); }
    set(); return !holding;
  } };
  function down(cx, cy, opts = {}) {
    if (isDisabled(el)) { rigidTick(el); return; }
    feel = feelOf(el);
    holding = true; fired = false; t0 = performance.now() / 1000; pressure = opts.pressure ?? 1; firm = Math.max(opts.firm ?? 0, rapidFirmness());
    el.style.setProperty('--cx', (cx * 100).toFixed(1) + '%'); el.style.setProperty('--cy', (cy * 100).toFixed(1) + '%');
    if (rebound) active.delete(rebound); if (creepSpring) active.delete(creepSpring);
    if (reducedMotion()) { d = Math.min(.6, pressure); set(); return; }
    wake(creepAnim);
    const w = el.offsetWidth, h = el.offsetHeight;
    rip.start(Math.hypot(Math.max(cx, 1 - cx) * w, Math.max(cy, 1 - cy) * h) * .55, .5 * feel.ripple);
  }
  function up() {
    if (!holding) return; holding = false; active.delete(creepAnim);
    const depth = d;
    if (reducedMotion()) { d = 0; creep = 0; set(); return; }
    const sp = feelSpring(reboundSpring(clamp(depth / feel.depth), firm), feel);
    rebound = new Spring(d, sp, x => { d = x; set(); });
    if (feel.linger) { const r = rebound; setTimeout(() => { if (rebound === r && !holding) r.to(0, sp); }, feel.linger * 1000); }   // sand holds the print a moment
    else rebound.to(0, sp);
    creepSpring = new Spring(creep, SPRING.release, x => { creep = x; set(); }); creepSpring.to(0);
    const w = el.offsetWidth, h = el.offsetHeight;
    const cx = parseFloat(el.style.getPropertyValue('--cx')) / 100 || .5, cy = parseFloat(el.style.getPropertyValue('--cy')) / 100 || .5;
    rip.start(Math.hypot(Math.max(cx, 1 - cx) * w, Math.max(cy, 1 - cy) * h), (.4 + .6 * depth) * feel.ripple);
  }
  return { down, up };
}

/* Bounce: a drop that lands, or is let go, settles with the same soft wobble as a slow press. */
const pressSpring = el => el._bounce || (el._bounce = new Spring(0, SPRING.lift, x => el.style.setProperty('--press', x.toFixed(3))));
function squash(el, v) { if (!el || reducedMotion()) return; pressSpring(el).to(v, SPRING.lift); }
function bounce(el, amount = 1) {
  if (!el || reducedMotion()) return; const feel = feelOf(el), s = pressSpring(el), sp = feelSpring(reboundSpring(.8, 0), feel);
  if (Math.abs(s.x) > .05) s.to(0, sp); else s.to(0, sp, s.v + 7 * amount * Math.sqrt(feel.depth));
}
/* Dip: the label under a finger gives a little while pressed, then springs back. */
function dip(el, v) { if (!el) return; const s = el._dip || (el._dip = new Spring(0, SPRING.lift, x => el.style.setProperty('--lp', x.toFixed(3)))); s.to(v, v ? SPRING.lift : SPRING.release); }
function rigidTick(el) { if (reducedMotion()) return; const s = new Spring(0, { k: 2000, c: 40 }, x => el.style.setProperty('--shiver', x.toFixed(2))); s.to(0, null, 30); }

/** One short jiggle, for an error appearing on a control. Still with reduced motion. */
export function jiggle(el) { if (reducedMotion()) return; const s = new Spring(0, SPRING.shiver, x => el.style.setProperty('--shiver', x.toFixed(2))); s.v = 160; s.to(0); }

const canHover = e => (e.pointerType === 'mouse' || e.pointerType === 'pen') && hoverQuery.matches;
function hoverable(trigger, target = trigger) {
  if (trigger._hov) return; const s = trigger._hov = new Spring(0, SPRING.lift, v => target.style.setProperty('--hover', v.toFixed(3)));
  trigger.addEventListener('pointerenter', e => { if (canHover(e) && !isDisabled(trigger)) s.to(1); });
  trigger.addEventListener('pointerleave', () => s.to(0));
}

/* ---------- Buttons and icon buttons ---------- */
function wireContact(el) {
  if (el._wired) return; el._wired = true;
  const hover = new Spring(0, SPRING.lift, v => el.style.setProperty('--hover', v.toFixed(3)));
  const f = fluid(el);
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return; const r = el.getBoundingClientRect();
    const pressure = e.pointerType === 'pen' ? clamp(e.pressure * 1.4, .15, 1) : 1;
    f.down((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, { pressure });
  });
  el.addEventListener('pointermove', e => {
    if (!canHover(e)) return; const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => el.addEventListener(t, () => f.up()));
  el.addEventListener('pointerenter', e => { if (canHover(e) && !isDisabled(el)) hover.to(1); });
  el.addEventListener('pointerleave', () => hover.to(0));
  el.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) f.down(.5, .5, { firm: 0 });
    if (e.repeat) lastContact = performance.now() / 1000;
  });
  el.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') f.up(); });
  el.addEventListener('blur', () => f.up());
  if (el.hasAttribute('aria-pressed')) {
    const ink = new Spring(el.getAttribute('aria-pressed') === 'true' ? 1 : 0, SPRING.release, v => el.style.setProperty('--dye', v.toFixed(3)));
    el.style.setProperty('--dye', ink.x);
    new MutationObserver(() => ink.to(el.getAttribute('aria-pressed') === 'true' ? 1 : 0)).observe(el, { attributes: true, attributeFilter: ['aria-pressed'] });
  }
}

/* Two-edge travel: the leading edge is stiffer than the trailing edge, so a moving drop stretches, then gathers. */
function travel(onFrame) {
  let L = null, R = null; const draw = () => onFrame(L.x, R.x - L.x, (L.v + R.v) / 2);
  return { to(left, width, instant) {
    if (!L) { L = new Spring(left, SPRING.travel, draw); R = new Spring(left + width, SPRING.travel, draw); }
    if (instant) { L.jump(left); R.jump(left + width); return; }
    const right = left > L.target; L.to(left, right ? SPRING.trail : SPRING.travel); R.to(left + width, right ? SPRING.travel : SPRING.trail);
  } };
}

/* A form reset restores values without a change event: re-place the component once the reset has applied. */
function followReset(el, place) {
  const form = el.closest('form'); if (!form) return;
  form.addEventListener('reset', () => setTimeout(() => place(false), 0));
}

/* ---------- Segmented control ---------- */
function wireSeg(seg) {
  if (seg._wired) return; seg._wired = true;
  seg.querySelectorAll('.m-seg-opt').forEach(l => hoverable(l));
  const track = document.createElement('span'); track.className = 'm-track'; track.setAttribute('aria-hidden', 'true');
  const ind = document.createElement('span'); ind.className = 'm-mat m-ind m-glass'; ind.setAttribute('aria-hidden', 'true');
  const anchor = seg.querySelector(':scope > legend');
  if (anchor) anchor.after(track, ind); else seg.prepend(track, ind);
  addBody(ind);
  let moving = false;
  const mover = travel((x, w, v) => {
    ind.style.left = x + 'px'; ind.style.width = w + 'px';
    const base = seg.querySelector('input:checked')?.closest('.m-seg-opt')?.offsetWidth || w;
    ind.style.transform = `scaleY(${Math.max(.86, Math.min(1, base / Math.max(1, w))).toFixed(3)})`;
    setFlow(ind, { k: clamp(Math.abs(v) / 1000) * .85, dir: Math.sign(v) || 1 });
    if (Math.abs(v) > 260) moving = true; else if (moving && Math.abs(v) < 60) { moving = false; bounce(ind, 1.4); }   // it lands, and the landing wobbles
  });
  const place = instant => {
    const c = seg.querySelector('input:checked'); const opt = c?.closest('.m-seg-opt');
    ind.hidden = !opt; if (!opt) return;
    mover.to(opt.offsetLeft, opt.offsetWidth, instant);
  };
  let pressing = false;
  seg.addEventListener('pointerdown', e => {
    const opt = e.target.closest('.m-seg-opt'); if (!opt || e.button !== 0 || opt.querySelector('input:disabled')) return;
    pressing = true; dip(opt, 1); if (opt.querySelector('input').checked) squash(ind, .55);
  });
  const release = () => {
    if (!pressing) return; pressing = false;
    seg.querySelectorAll('.m-seg-opt').forEach(l => dip(l, 0));
    if (Math.abs(pressSpring(ind).x) > .05) bounce(ind, .9);
  };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => seg.addEventListener(t, release));
  seg.addEventListener('change', () => place(false));
  seg._place = place;
  followReset(seg, place);
  place(true);
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => place(true)).observe(seg);
}

/* ---------- Switch ---------- */
function wireSwitch(sw) {
  if (sw._wired) return; sw._wired = true;
  const input = sw.querySelector('input'), track = sw.querySelector('.m-switch-track'), thumb = sw.querySelector('.m-thumb');
  if (!input || !track || !thumb) return;
  addBody(thumb); const c = fluid(thumb);
  const ink = new Spring(input.checked ? 1 : 0, SPRING.release, v => track.style.setProperty('--dye', v.toFixed(3)));
  track.style.setProperty('--dye', ink.x);
  const mover = travel((x, w, v) => {
    thumb.style.left = (3 + x) + 'px'; thumb.style.width = w + 'px';
    thumb.style.transform = `scaleY(${Math.max(.86, 26 / Math.max(26, w)).toFixed(3)})`;
    track.style.setProperty('--tx', (3 + x + w / 2) + 'px');
    setFlow(thumb, { k: clamp(Math.abs(v) / 900) * .8, dir: Math.sign(v) || 1 });
  });
  const place = instant => { mover.to(input.checked ? 20 : 0, 26, instant); if (instant) ink.jump(input.checked ? 1 : 0); else ink.to(input.checked ? 1 : 0); };
  input.addEventListener('change', () => place(false));
  sw.addEventListener('pointerdown', e => { if (e.button === 0) c.down(.5, .5); });
  hoverable(sw, thumb);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => sw.addEventListener(t, () => c.up()));
  input.addEventListener('keydown', e => { if (e.key === ' ' && !e.repeat) c.down(.5, .5); });
  input.addEventListener('keyup', e => { if (e.key === ' ') c.up(); });
  input.addEventListener('blur', () => c.up());   // Space held while focus moves away: no keyup will come
  sw._place = place;
  followReset(sw, place);
  place(true);
}

/* ---------- Slider ---------- */
function dragStretchFor(speed, feel) {
  const x = Math.abs(speed) / FLUID.dragPeak;
  return FLUID.dragStretch * x * Math.exp(1 - x) * feel.stretch;
}
function wireSlider(sl) {
  if (sl._wired) return; sl._wired = true;
  const input = sl.querySelector('input[type="range"]'), thumb = sl.querySelector('.m-thumb'), fill = sl.querySelector('.m-fill');
  if (!input || !thumb || !fill) return;
  addBody(thumb);
  const lift = new Spring(0, SPRING.lift, v => thumb.style.setProperty('--lift', v.toFixed(3)));
  hoverable(sl, thumb);
  let dragging = false, lastX = 0, lastT = 0, rest = 0;
  const frac = () => { const min = +input.min || 0, max = input.max === '' ? 100 : +input.max; return max > min ? (input.value - min) / (max - min) : 0; };
  const travelWidth = () => sl.offsetWidth - 28;
  const render = (x, speedPxMs) => {
    const st = dragStretchFor(speedPxMs, feelOf(sl));
    sl.style.setProperty('--m-value', x.toFixed(4));
    thumb.style.setProperty('--stretch', st.toFixed(3));
    setFlow(thumb, { k: st / FLUID.dragStretch, dir: Math.sign(speedPxMs) || 1 });
  };
  const pos = new Spring(frac(), SPRING.travel, (x, v) => render(x, v * travelWidth() / 1000));
  sl._place = instant => {
    const f = frac();
    if (instant) { pos.jump(f); return; }
    if (dragging) {
      const now = performance.now(), px = f * travelWidth(); const speed = (px - lastX) / Math.max(8, now - lastT); lastX = px; lastT = now;
      pos.x = pos.target = f; pos.v = 0; render(f, speed); clearTimeout(rest); rest = setTimeout(() => render(pos.x, 0), 90); return;
    }
    pos.to(f);
  };
  input.addEventListener('pointerdown', () => { if (input.disabled) return; dragging = true; lastX = frac() * travelWidth(); lastT = performance.now(); lift.to(1); });
  const end = () => { if (!dragging) return; dragging = false; lift.to(0, SPRING.release); render(pos.x, 0); bounce(thumb, .6); };   // set down, it settles with a wobble
  input.addEventListener('pointerup', end); input.addEventListener('pointercancel', end); input.addEventListener('blur', () => lift.to(0));
  input.addEventListener('input', () => sl._place(false));
  input.addEventListener('change', () => sl._place(false));   // a value set from script, announced with a change event
  followReset(sl, sl._place);
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => sl._place(true)).observe(sl);
  sl._place(true);
  sl.dataset.mReady = '';
}

/* ---------- Field: one jiggle when an error appears ---------- */
function wireField(well) {
  if (well._wired) return; well._wired = true;
  const control = well.querySelector('input, textarea'); if (!control) return;
  let invalid = control.getAttribute('aria-invalid') === 'true';
  new MutationObserver(() => {
    const now = control.getAttribute('aria-invalid') === 'true';
    if (now && !invalid) jiggle(well);
    invalid = now;
  }).observe(control, { attributes: true, attributeFilter: ['aria-invalid'] });
}

/* ---------- Tabs: the ARIA tabs pattern with automatic activation ---------- */
/** Keyboard navigation skips controls that cannot take focus: disabled, inert or not rendered. */
function canFocus(el) {
  if (el.disabled || el.matches(':disabled') || el.closest('[inert]')) return false;   // :disabled also covers a disabled fieldset around it
  return typeof el.checkVisibility === 'function' ? el.checkVisibility({ visibilityProperty: true }) : el.getClientRects().length > 0;
}

function wireTabs(tabs) {
  if (tabs._wired) { tabs._prepTabs?.(); return; } tabs._wired = true;   // enhancing again prepares tabs added since
  const list = tabs.querySelector('[role="tablist"]'); if (!list) return;
  const all = () => [...list.querySelectorAll('[role="tab"]')];
  const usable = () => all().filter(canFocus);
  const ind = document.createElement('span'); ind.className = 'm-mat m-ind'; ind.setAttribute('aria-hidden', 'true');
  list.prepend(ind); addBody(ind);
  let moving = false;
  const mover = travel((x, w, v) => {
    ind.style.left = x + 'px'; ind.style.width = w + 'px';
    setFlow(ind, { k: clamp(Math.abs(v) / 1000) * .85, dir: Math.sign(v) || 1 });
    if (Math.abs(v) > 260) moving = true; else if (moving && Math.abs(v) < 60) { moving = false; bounce(ind, 1.2); }
  });
  const place = instant => { const t = all().find(x => x.getAttribute('aria-selected') === 'true'); ind.hidden = !t; if (t) mover.to(t.offsetLeft, t.offsetWidth, instant); };
  const select = (tab, focus) => {
    for (const t of all()) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
    place(false);
    tabs.dispatchEvent(new CustomEvent('tabchange', { bubbles: true, detail: { tab } }));
  };
  tabs._prepTabs = () => { for (const t of all()) {
    if (t._wiredTab) continue; t._wiredTab = true;
    if (t.matches('button') && !t.hasAttribute('type')) t.type = 'button';   // inside a form, a tab must not submit it
    hoverable(t);
    t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
    t.addEventListener('click', () => { if (!t.disabled) select(t, false); });
  } };
  tabs._prepTabs();
  list.addEventListener('keydown', e => {
    const tabsNow = usable(); const i = tabsNow.indexOf(document.activeElement); if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabsNow.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabsNow[(next + tabsNow.length) % tabsNow.length], true);
  });
  tabs._place = place;
  place(true);
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => place(true)).observe(list);
}

/* ---------- Toolbar: one Tab stop; arrow keys, Home and End move between controls ---------- */
const toolbarSyncs = new Set();
let toolbarTabWatch = false;
function wireToolbar(bar) {
  if (bar._wiredBar) return; bar._wiredBar = true;
  const candidates = () => [...bar.querySelectorAll('button, [href], input, select, textarea, [tabindex]')]
    .filter(el => {
      if (el.closest('.m-toolbar') !== bar) return false;
      const overlay = el.closest('[popover], dialog');   // skip controls in an overlay inside the bar, not a bar inside an overlay
      return !overlay || !bar.contains(overlay);
    });
  const usable = canFocus;
  const items = () => candidates().filter(usable);
  // The bar's one Tab stop must be a control that can take focus. Keep the current stop while it can;
  // otherwise move it to the first usable control. Hidden and disabled controls are skipped by the arrow keys too.
  const sync = () => {
    const all = candidates(), list = all.filter(usable);
    const stop = list.find(el => el.getAttribute('tabindex') === '0') || list[0];
    all.forEach(el => { const t = el === stop ? 0 : -1; if (el.tabIndex !== t || !el.hasAttribute('tabindex')) el.tabIndex = t; });
  };
  sync();
  toolbarSyncs.add(sync);
  if (typeof MutationObserver === 'function') new MutationObserver(sync).observe(bar, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'inert', 'class'] });
  if (!toolbarTabWatch) {   // a stop hidden some other way (inline style, a stylesheet) is caught as Tab is pressed
    toolbarTabWatch = true;
    document.addEventListener('keydown', e => { if (e.key === 'Tab') toolbarSyncs.forEach(f => f()); }, true);
  }
  bar.addEventListener('focusin', e => { if (!items().includes(e.target)) return; candidates().forEach(el => { el.tabIndex = el === e.target ? 0 : -1; }); });
  let pending = null;   // a key a text field or slider may have had no use for, checked when it is released
  bar.addEventListener('keydown', e => {
    if (!e.repeat) pending = null;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.isComposing) return;
    const vertical = bar.getAttribute('aria-orientation') === 'vertical';
    const rtl = !vertical && getComputedStyle(bar).direction === 'rtl';
    const el = document.activeElement, list = items(), i = list.indexOf(el); if (i < 0) return;
    const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const step = { [next]: i + 1, [prev]: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (step === undefined) return;
    const go = () => list[(step + list.length) % list.length].focus();
    // A text field or slider keeps the key for itself. The bar only takes it once the control
    // has nothing left to do with it: the caret or the value is already at that end.
    const where = editState(el);
    if (where === null) { e.preventDefault(); go(); return; }
    if (!e.repeat) pending = { key: e.key, el, where, go };   // holding a key to reach the end must not carry focus out
  });
  bar.addEventListener('keyup', e => {
    const p = pending; if (!p || p.key !== e.key) return; pending = null;
    if (document.activeElement === p.el && editState(p.el) === p.where) p.go();
  });
}
const TEXT_TYPES = new Set(['text', 'search', 'url', 'tel', 'password']);
function editState(el) {
  if (el.matches('input[type="range" i]')) return el.value;
  if (el.matches('textarea') || (el.matches('input') && TEXT_TYPES.has(el.type))) return `${el.value}|${el.selectionStart}|${el.selectionEnd}`;
  if (el.isContentEditable) {
    const sel = getSelection(); if (!sel || !sel.rangeCount) return el.textContent;
    const r = sel.getRangeAt(0), upTo = (node, offset) => { const x = document.createRange(); x.selectNodeContents(el); x.setEnd(node, offset); return x.toString().length; };
    return `${el.textContent}|${upTo(r.startContainer, r.startOffset)}|${upTo(r.endContainer, r.endOffset)}`;
  }
  return null;
}

/* ---------- Dialog and sheet: native <dialog>, opened by any [data-m-open] button ---------- */
function wireOpener(btn) {
  if (btn._wiredOpen) return; btn._wiredOpen = true;
  if (btn.matches('button') && !btn.hasAttribute('type')) btn.type = 'button';   // inside a form, opening must not submit it
  btn.addEventListener('click', () => {
    const d = document.getElementById(btn.dataset.mOpen);
    if (d && typeof d.showModal === 'function' && !d.open) d.showModal();
  });
}
function wireSheet(sheet) {
  if (sheet._wiredSheet) return; sheet._wiredSheet = true;
  // Light dismiss: a click on the backdrop closes a sheet. Dialogs keep their decision until it is made.
  sheet.addEventListener('click', e => {
    if (e.target !== sheet) return;
    const r = sheet.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) sheet.close();
  });
  const grab = sheet.querySelector('.m-sheet-grabber'); if (!grab) return;
  // Drag down on the grabber to dismiss; let go early and it springs back. Arrow keys on the grabber do the same.
  let y0 = 0, dy = 0, dragging = false;
  const back = new Spring(0, SPRING.release, v => sheet.style.setProperty('--m-drag', `${Math.max(0, v).toFixed(1)}px`));
  grab.addEventListener('pointerdown', e => { dragging = true; y0 = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId); sheet.classList.add('is-dragging'); });
  grab.addEventListener('pointermove', e => { if (!dragging) return; dy = Math.max(0, e.clientY - y0); back.jump(dy); });
  const end = () => {
    if (!dragging) return; dragging = false; sheet.classList.remove('is-dragging');
    if (dy > Math.min(120, sheet.offsetHeight * .3)) { sheet.close(); back.jump(0); }
    else { back.x = dy; back.to(0); }
  };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  grab.addEventListener('click', e => { if (e.detail === 0 || dy < 4) sheet.close(); dy = 0; });   // detail 0: Enter or Space
}

/* ---------- Menu: a popover with the ARIA menu keys ---------- */
function wireMenu(trigger) {
  const menu = document.getElementById(trigger.getAttribute('popovertarget'));
  if (!menu || !('popover' in HTMLElement.prototype)) return;
  // Several buttons may open one menu (native popovers allow it). The menu is wired once;
  // each button only records itself as the opener, so a choice is announced once and focus
  // and position follow the button that opened it.
  const state = menu._menu || (menu._menu = wireMenuPopover(menu));
  state.prepItems();   // items added since the last enhance get the same treatment
  if (trigger._wiredMenu) return; trigger._wiredMenu = true;
  state.triggers.add(trigger);
  trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => { if (!menu.matches(':popover-open')) state.trigger = trigger; });
  trigger.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    state.openAt = e.key === 'ArrowUp' ? 'last' : 'first';
    if (menu.matches(':popover-open') && state.trigger !== trigger) menu.hidePopover();
    state.trigger = trigger;
    if (!menu.matches(':popover-open')) menu.showPopover();
    else { state.focusItem(); }
  });
}
function wireMenuPopover(menu) {
  const state = { trigger: null, triggers: new Set(), openAt: 'first' };   // openAt: ArrowUp on the button opens at the last item
  const opener = () => state.trigger || state.triggers.values().next().value;
  if (!menu.getAttribute('role')) menu.setAttribute('role', 'menu');
  const items = () => [...menu.querySelectorAll('[role^="menuitem"]')].filter(canFocus);
  // Every item, shown or not: inside a form an item must not submit it, and only the arrow keys reach it.
  state.prepItems = () => menu.querySelectorAll('[role^="menuitem"]').forEach(i => {
    if (i.getAttribute('tabindex') !== '-1') i.tabIndex = -1;
    if (i.matches('button') && !i.hasAttribute('type')) i.type = 'button';
  });
  state.focusItem = () => { (state.openAt === 'last' ? items().at(-1) : items()[0])?.focus(); state.openAt = 'first'; };
  let size = { width: 0, height: 0 };   // a closed menu has no size, so the last open size stands in for it
  const position = () => {
    const btn = opener(); if (!btn) return;
    const r = menu.getBoundingClientRect(); if (r.height) size = { width: r.width, height: r.height };
    const t = btn.getBoundingClientRect(), m = size, gap = 6, pad = 8;
    const below = t.bottom + gap + m.height <= innerHeight - pad || t.top - gap - m.height < pad;
    let left = Math.min(Math.max(pad, t.left), innerWidth - m.width - pad);
    const top = below ? t.bottom + gap : t.top - gap - m.height;
    menu.style.left = `${left}px`; menu.style.top = `${Math.max(pad, top)}px`;
    menu.style.setProperty('--m-origin', `${t.left + t.width / 2 - left}px ${below ? 'top' : 'bottom'}`);
  };
  // While open, the menu follows its button when the page scrolls or the window changes size.
  let frame = 0;
  const follow = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (menu.matches(':popover-open')) position(); }); };
  // Place the menu by its button before it is first painted, then again once its size is known.
  menu.addEventListener('beforetoggle', e => { if (e.newState === 'open') { state.prepItems(); position(); } });
  menu.addEventListener('toggle', e => {
    const open = e.newState === 'open', btn = opener();
    state.triggers.forEach(t => t.setAttribute('aria-expanded', String(open && t === btn)));
    if (open) { addEventListener('scroll', follow, { capture: true, passive: true }); addEventListener('resize', follow); }
    else { removeEventListener('scroll', follow, { capture: true }); removeEventListener('resize', follow); }
    if (open) { position(); state.focusItem(); }
    else if (menu.contains(document.activeElement) || document.activeElement === document.body) btn?.focus();
  });
  menu.addEventListener('keydown', e => {
    const list = items(), i = list.indexOf(document.activeElement);
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (next !== undefined) { e.preventDefault(); list[(next + list.length) % list.length].focus(); return; }
    if (e.key === 'Tab') { menu.hidePopover(); return; }
    if (e.key.length === 1 && /\S/.test(e.key)) {   // type-ahead: the next item starting with that letter
      const k = e.key.toLowerCase(), order = [...list.slice(i + 1), ...list.slice(0, i + 1)];
      order.find(it => it.textContent.trim().toLowerCase().startsWith(k))?.focus();
    }
  });
  menu.addEventListener('click', e => {
    const item = e.target.closest('[role^="menuitem"]'); if (!item || item.disabled) return;
    // Close and return focus first, so a dialog opened by the handler returns focus to the button, not to a hidden item.
    menu.hidePopover(); opener()?.focus();
    menu.dispatchEvent(new CustomEvent('menuselect', { bubbles: true, detail: { item, value: item.value || item.textContent.trim(), trigger: opener() } }));
  });
  return state;
}

/** Re-place indicators after a value is changed from script (a change event does it automatically). */
export function refresh(root = document) {
  root.querySelectorAll('.m-seg, .m-switch, .m-slider, .m-tabs').forEach(el => el._place?.(true));
}

/** Wire every Meridian component inside root. */
export function enhance(root = document) {
  root.querySelectorAll('.m-mat').forEach(el => {
    if (el.matches('.m-thumb, .m-ind')) return;
    addBody(el);
    if (el.matches('.m-well')) wireField(el);
    else if (!el.matches('.m-surface')) wireContact(el);
  });
  root.querySelectorAll('.m-seg').forEach(wireSeg);
  root.querySelectorAll('.m-switch').forEach(wireSwitch);
  root.querySelectorAll('.m-slider').forEach(wireSlider);
  root.querySelectorAll('.m-tabs').forEach(wireTabs);
  root.querySelectorAll('.m-toolbar').forEach(wireToolbar);
  root.querySelectorAll('[data-m-open]').forEach(wireOpener);
  root.querySelectorAll('dialog.m-sheet').forEach(wireSheet);
  root.querySelectorAll('[popovertarget]').forEach(t => { if (document.getElementById(t.getAttribute('popovertarget'))?.classList.contains('m-menu')) wireMenu(t); });
}
