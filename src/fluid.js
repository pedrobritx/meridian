// Meridian Fluid + Sun: pure functions shared by the lab page and its tests.
// Constants come from the token source (src/tokens.js, generated from tokens/meridian.tokens.json).
import { tokens } from './tokens.js';

/* ---------------- Non-Newtonian contact (shear-thickening) ----------------
   Like cornflour in water: slow pressure sinks in, a fast strike meets a firm
   surface. Depth creeps toward the target while contact lasts; quick taps are
   released before they sink. Rapid repetition raises firmness, which caps depth
   and damps the rebound. Slow, deep presses rebound with a visible wobble. */
export const FLUID = tokens.fluid;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Firmness from the interval since the previous contact (seconds). 0 = soft, 1 = firm. */
export function firmnessFromInterval(interval, { firmWindow, firmFloor } = FLUID) {
  if (!(interval >= 0) || interval >= firmWindow) return 0;
  return clamp(1 - (interval - firmFloor) / (firmWindow - firmFloor));
}

/** Depth reached after holding for t seconds at a given pressure (0..1) and firmness. */
export function depthAfter(t, pressure = 1, firm = 0, { creepTau, depthCapFirm } = FLUID) {
  const cap = pressure * (1 - (1 - depthCapFirm) * firm);
  return cap * (1 - Math.exp(-Math.max(0, t) / creepTau));
}

/** Spring for the rebound: deeper presses wobble, shallow and firm ones settle crisply. */
export function reboundSpring(depth, firm, F = FLUID) {
  const crisp = clamp(Math.max(firm, 1 - depth));
  const zeta = F.zetaSoft + (F.zetaFirm - F.zetaSoft) * crisp;
  const k = F.kSoft + (F.kFirm - F.kSoft) * crisp;
  return { k, c: 2 * zeta * Math.sqrt(k), zeta };
}

/* ---------------- Feel: each environment's material behaves like its physical counterpart ----------------
   What a press does is the same everywhere (same hit areas, same outcomes, settles within FEEL_SETTLE);
   how it gives and recovers follows the material the environment is made of. */
export const FEEL = Object.fromEntries(Object.entries(tokens.environments).map(([id, e]) => [id, e.feel]));
export const FEEL_SETTLE = tokens.feelSettle;   // s: every feel settles within this (linger included), so timing never changes what happens

/** The rebound spring for an environment's feel. Damping stays within 0.3 to 1 (some wobble, never sluggish). */
export function feelSpring(sp, f = FEEL.prism) {
  const k = sp.k * f.k, zeta = clamp(sp.zeta + f.zeta, .3, 1);
  return { k, c: 2 * zeta * Math.sqrt(k), zeta };
}

/** Time for a spring released from depth d to stay within 1% of rest (numerical, 1 ms steps). */
export function settleTime({ k, c }, d = 1) {
  let x = d, v = 0, t = 0, quiet = 0; const h = .001;
  while (t < 3) { const a = -k * x - c * v; v += a * h; x += v * h; t += h; quiet = Math.abs(x) < .01 * d && Math.abs(v) < .1 ? quiet + h : 0; if (quiet > .05) return t - quiet; }
  return t;
}

/** Droplet stretch for a drag speed (px/ms): rises, peaks, then firms at high speed. */
export function dragStretch(speed, { dragPeak, dragStretch: s } = FLUID) {
  const x = Math.abs(speed) / dragPeak;
  return s * x * Math.exp(1 - x);
}

/* ---------------- Sun position (NOAA general solar position) ---------------- */
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;

/** Sun elevation and azimuth (degrees, azimuth clockwise from north) for a UTC date. */
export function sunPosition(date, lat, lon) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const doy = Math.floor((date.getTime() - start) / 864e5) + 1;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const g = 2 * Math.PI / 365 * (doy - 1 + (hour - 12) / 24);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const tst = hour * 60 + eqt + 4 * lon;                 // true solar time, minutes
  const ha = rad(tst / 4 - 180);                          // hour angle
  const phi = rad(lat);
  const cosZ = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
  const zen = Math.acos(clamp(cosZ, -1, 1));
  const azSouth = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi));
  return { elevation: 90 - deg(zen), azimuth: (deg(azSouth) + 180 + 360) % 360, declination: deg(decl) };
}

/** UTC date for a given local mean solar hour at a longitude, on the same calendar day as `day`. */
export function dateAtSolarHour(day, hour, lon) {
  const utcHour = hour - lon / 15;
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()) + utcHour * 3600e3);
}

/** Local mean solar hour (0..24) at a longitude for a UTC date. */
export function solarHour(date, lon) {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + lon / 15;
  return ((h % 24) + 24) % 24;
}

/**
 * Project the sun onto a screen the viewer faces (heading, degrees from north).
 * Returns the screen-space angle the light comes from (degrees; -90 = from the top,
 * 0 = from the right, -180 = from the left), always kept in the upper half: people
 * assume light from above, and light from below flips raised into sunken.
 */
export function screenLight(sun, heading, { minUp = 12 } = {}) {
  if (sun.elevation <= 0) return { angle: -90, night: true, strength: 0 };
  const e = rad(sun.elevation), a = rad(sun.azimuth), h = rad(heading);
  const s = [Math.cos(e) * Math.sin(a), Math.cos(e) * Math.cos(a), Math.sin(e)]; // east, north, up
  const right = [Math.cos(h), -Math.sin(h), 0];
  const sx = s[0] * right[0] + s[1] * right[1], sy = s[2];
  let angle = Math.hypot(sx, sy) < 0.05 ? -90 : deg(Math.atan2(-sy, sx));
  angle = clamp(angle, -180 + minUp, -minUp);
  return { angle, night: false, strength: Math.sin(e) };
}

/** Shadow length factor from sun elevation: long and soft when low, short at noon. */
export function shadowLength(elevation) {
  if (elevation <= 0) return 1;
  return clamp(0.35 / Math.tan(rad(Math.max(elevation, 6))), 0.7, 2.2);
}

/** Warm low sun to white high sun. */
export function sunColour(elevation) {
  const t = clamp(elevation / 40);
  const low = [255, 196, 146], high = [255, 250, 244];
  return low.map((v, i) => Math.round(v + (high[i] - v) * t));
}
