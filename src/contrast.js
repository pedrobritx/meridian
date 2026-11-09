// WCAG 2.2 contrast helpers, shared by the tests and by products that adopt Meridian.

export const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

const channel = c => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };

export const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** Contrast ratio between two colours given as hex strings or [r, g, b]. */
export function contrast(a, b) {
  const la = luminance(typeof a === 'string' ? hexToRgb(a) : a);
  const lb = luminance(typeof b === 'string' ? hexToRgb(b) : b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** A translucent colour at the given alpha laid over an opaque one, as [r, g, b]. */
export function composite(top, alpha, bottom) {
  const t = typeof top === 'string' ? hexToRgb(top) : top;
  const b = typeof bottom === 'string' ? hexToRgb(bottom) : bottom;
  return t.map((v, i) => v * alpha + b[i] * (1 - alpha));
}
