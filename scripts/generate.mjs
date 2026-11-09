// Pure generators: token file in, CSS and ES module text out.
// scripts/build.mjs writes the results; the tests compare them with the committed files.

const px = n => `${n}px`;
const hexToRgbList = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');
const round = (n, d = 3) => Number(n.toFixed(d));

/** Custom properties for one environment in one appearance. */
export function environmentVars(tokens, env, appearance) {
  const e = tokens.environments[env];
  const p = e[appearance];
  const a = tokens.material.appearance[appearance];
  const error = tokens.feedback[appearance].error;
  const rad = e.light.angle * Math.PI / 180;
  return {
    'color-scheme': appearance === 'dusk' ? 'dark' : 'light',
    '--g0': p.ground[0], '--g1': p.ground[1], '--g2': p.ground[2],
    '--surface': p.surface, '--surface-2': p.surface2,
    '--ink': p.ink, '--muted': p.muted,
    '--accent': p.accent, '--on-accent': p.onAccent, '--accent-ink': p.accentInk,
    '--line': p.line, '--focus': p.focus, '--error': error,
    '--accent-rgb': hexToRgbList(p.accent), '--on-accent-rgb': hexToRgbList(p.onAccent), '--error-rgb': hexToRgbList(error),
    '--glass-rgb': hexToRgbList(p.surface), '--glass-a': String(p.glass),
    '--light-rgb': p.lightRGB, '--shadow-rgb': p.shadowRGB,
    '--light-deg': `${e.light.angle - 90}deg`, '--lx': String(round(Math.cos(rad))), '--ly': String(round(Math.sin(rad))),
    '--frost': px(e.material.frost), '--refract': px(e.material.refract),
    '--sheen': String(round(e.material.sheen * a.sheenFactor)), '--glow': String(a.glow),
    '--guard': String(a.guard), '--rim': String(a.rim),
    '--hair': appearance === 'dusk' ? 'rgb(255 255 255 / .10)' : `rgb(${p.shadowRGB} / .12)`,
  };
}

const block = (selector, vars, indent = '') => {
  const body = Object.entries(vars).map(([k, v]) => `${indent}  ${k}: ${v};`).join('\n');
  return `${indent}${selector} {\n${body}\n${indent}}`;
};

/** The whole stylesheet. Token selectors use :where() so they carry no specificity:
 *  products override them with plain selectors, and the fallbacks below always win. */
export function buildCSS(tokens) {
  const out = [];
  const { defaults, motion, space, radius, type, contexts } = tokens;
  const desk = contexts[defaults.context];
  const touch = contexts.touch;

  out.push(`/* Meridian ${tokens.version}. Generated from tokens/meridian.tokens.json by npm run build. Do not edit by hand. */`);
  out.push('@layer meridian {');

  out.push(block(':where(:root)', {
    '--font-ui': type.ui, '--font-display': type.display, '--font-read': type.read,
    ...Object.fromEntries(Object.entries(space).map(([k, v]) => [`--${k}`, px(v)])),
    ...Object.fromEntries(Object.entries(radius).map(([k, v]) => [`--r-${k}`, px(v)])),
    ...Object.fromEntries(Object.entries(motion.duration).map(([k, v]) => [`--dur-${k}`, `${v}ms`])),
    ...Object.fromEntries(Object.entries(motion.ease).map(([k, v]) => [`--ease-${k}`, v])),
    '--max-glass-a': String(tokens.material.maxGlassAlpha),
    '--target': px(desk.target), '--gap': px(desk.gap),
  }, '  '));

  for (const env of Object.keys(tokens.environments)) {
    const isDefault = env === defaults.environment;
    const sel = (extra = '') => {
      const own = `[data-env="${env}"]${extra}`;
      return isDefault ? `:where(:root:not([data-env])${extra}, ${own})` : `:where(${own})`;
    };
    out.push(`\n  /* ${tokens.environments[env].name} */`);
    out.push(block(sel(), environmentVars(tokens, env, 'dawn'), '  '));
    out.push(`  @media (prefers-color-scheme: dark) {\n${block(sel(':not([data-appearance])'), environmentVars(tokens, env, 'dusk'), '    ')}\n  }`);
    out.push(block(sel('[data-appearance="dawn"]'), environmentVars(tokens, env, 'dawn'), '  '));
    out.push(block(sel('[data-appearance="dusk"]'), environmentVars(tokens, env, 'dusk'), '  '));
  }

  out.push('\n  /* Contexts: Desk and Touch are built for the web; the others are written specs in the token file. */');
  for (const [id, c] of Object.entries(contexts)) {
    if (c.status !== 'web') continue;
    out.push(block(`:where([data-context="${id}"])`, { '--target': px(c.target), '--gap': px(c.gap) }, '  '));
  }
  out.push(`  /* Wherever touch is possible, targets grow to the Touch size. */\n  @media (any-pointer: coarse) {\n${block(`:where(:root:not([data-context]), [data-context="${defaults.context}"])`, { '--target': px(touch.target), '--gap': px(touch.gap) }, '    ')}\n  }`);
  out.push('}');

  const solid = { '--glass-a': '1', '--frost': '0px', '--refract': '0px' };
  const still = Object.fromEntries(Object.keys(motion.duration).map(k => [`--dur-${k}`, '0ms']));
  out.push('\n/* Fallbacks sit outside the layer and carry specificity, so they win over any environment. */');
  out.push('/* Solid: every glass surface falls back to its opaque surface colour. */');
  out.push(`@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {\n${block(':root, [data-env]', solid, '  ')}\n}`);
  out.push(`@media (prefers-reduced-transparency: reduce) {\n${block(':root, [data-env]', solid, '  ')}\n}`);
  out.push(block('[data-tier="solid"], [data-tier="solid"] [data-env]', solid));
  out.push('/* Reduced motion: transitions become instant; springs read the same preference in JavaScript. */');
  out.push(`@media (prefers-reduced-motion: reduce) {\n${block(':root, [data-env]', still, '  ')}\n}`);
  out.push(block('[data-motion="reduced"], [data-motion="reduced"] [data-env]', still));
  return out.join('\n') + '\n';
}

export function buildModule(tokens) {
  return `// Generated from tokens/meridian.tokens.json by npm run build. Do not edit by hand.\nexport const tokens = ${JSON.stringify(tokens, null, 2)};\nexport default tokens;\n`;
}
