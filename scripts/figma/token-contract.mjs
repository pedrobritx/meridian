/** Plugin export contract, independent of the Enterprise-only Variables REST API. */
export const profiles = [
  { id: "grass", name: "Grass", light: "Dawn", dark: "Dusk" },
  { id: "paper", name: "Paper", light: "PaperDawn", dark: "PaperDusk" },
  { id: "core", name: "Core", light: "CoreDawn", dark: "CoreDusk" },
  { id: "parallel", name: "Parallel", light: "ParallelDawn", dark: "ParallelDusk", projectColour: true },
  { id: "canvas", name: "Canvas", light: "CanvasDawn", dark: "CanvasDusk", projectColour: true },
  { id: "gallery", name: "Gallery", light: "GalleryDawn", dark: "GalleryDusk", projectColour: true },
];

export function profileForMode(mode) {
  const profile = profiles.find(p => p.light === mode || p.dark === mode);
  if (!profile) throw Error("Unsupported CSS theme mode");
  return { ...profile, nativeName: profile.name + " / " + (profile.light === mode ? "Dawn" : "Dusk") };
}

export function validateTokens(bundle, config) {
  if (bundle?.fileKey !== config.fileKey || bundle.schemaVersion !== 1) {
    throw new Error(
      "Token bundle does not match the configured Figma file/schema",
    );
  }
  const entries = Object.entries(bundle.modes ?? {});
  if (
    entries.length !== config.themeModes.length ||
    entries.some(([mode]) => !config.themeModes.includes(mode))
  ) {
    throw new Error("Token modes must exactly match configured profiles");
  }
  entries.sort(
    ([a], [b]) => config.themeModes.indexOf(a) - config.themeModes.indexOf(b),
  );
  let keys;
  for (const [, tokens] of entries) {
    const names = Object.keys(tokens).sort();
    if (names.length < 1 || names.length > 500)
      throw new Error("Invalid token count");
    if (keys && JSON.stringify(keys) !== JSON.stringify(names))
      throw new Error("Theme token names differ");
    keys = names;
    const cssNames = new Set();
    for (const [name, token] of Object.entries(tokens)) {
      if (!/^[a-z][a-z0-9/-]{1,100}$/.test(name))
        throw new Error("Unsafe token name");
      const cssName = name.replaceAll("/", "-");
      if (cssNames.has(cssName)) throw new Error("Colliding CSS token names");
      cssNames.add(cssName);
      if (token.type === "COLOR") {
        for (const channel of ["r", "g", "b", "a"]) {
          const number = token.value?.[channel];
          if (!Number.isFinite(number) || number < 0 || number > 1)
            throw new Error("Invalid colour");
        }
      } else if (token.type === "FLOAT") {
        if (
          !Number.isFinite(token.value) ||
          token.value < 0 ||
          token.value > 10000
        )
          throw new Error("Invalid numeric token");
        if (name.startsWith("opacity/") && token.value > 100)
          throw new Error("Figma opacity must be a percentage from 0 to 100");
      } else if (token.type === "STRING") {
        const font =
          /^typography\/[a-z0-9-]+\/family$/.test(name) &&
          ["Manrope", "Fraunces", "Newsreader", "JetBrains Mono", "Geist", "Geist Mono", "Inter", "Cormorant Garamond"].includes(
            token.value,
          );
        const easing =
          /^motion\/easing\/[a-z-]+$/.test(name) &&
          typeof token.value === "string" &&
          /^cubic-bezier\(\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/.test(
            token.value,
          );
        if (!font && !easing)
          throw new Error("Unsupported or unsafe string token");
      } else throw new Error("Unsupported token type");
    }
  }
  // Remove timestamps and any additional plugin input from committed data.
  return {
    schemaVersion: 1,
    fileKey: config.fileKey,
    modes: Object.fromEntries(
      entries.map(([mode, tokens]) => [
        mode,
        Object.fromEntries(
          Object.keys(tokens)
            .sort()
            .map((name) => [
              name,
              { type: tokens[name].type, value: tokens[name].value },
            ]),
        ),
      ]),
    ),
  };
}

export function tokenCss(bundle) {
  const css = [
    "/* Generated Meridian reference tokens. Reviewed adaptation into a product is required. */",
  ];
  for (const [mode, tokens] of Object.entries(bundle.modes)) {
    const profile = profileForMode(mode);
    const selector = `[data-meridian="${profile.id}"]`;
    const light = profile.light === mode;
    const selectors = light
      ? (profile.id === "grass" ? ":root, " : "") + selector
      : (profile.id === "grass" ? ".dark:not([data-meridian]), " : "") + `${selector}[data-theme="dark"], ${selector}.dark:not([data-theme="light"])`;
    css.push(`${selectors} {`);
    for (const [name, token] of Object.entries(tokens)) {
      let value = token.value;
      if (token.type === "COLOR") {
        const { r, g, b, a } = value;
        value = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${Number(a.toFixed(4))})`;
      } else if (token.type === "STRING") {
        value = name.endsWith("/family") ? JSON.stringify(value) : value;
      } else {
        value = Number(value.toFixed(4));
        if (name.startsWith("opacity/"))
          value = Number((value / 100).toFixed(4));
        else if (name.startsWith("motion/duration/")) value = `${value}ms`;
        else if (
          /^(spacing|radius|size|layout|blur|stroke|focus|breakpoint|elevation)\//.test(
            name,
          ) ||
          /^typography\/[^/]+\/(size|line-height|letter-spacing)$/.test(name) ||
          /^grid\/[^/]+\/(gutter|margin)$/.test(name) ||
          name.startsWith("motion/translate/")
        )
          value = `${value}px`;
      }
      css.push(`  --meridian-${name.replaceAll("/", "-")}: ${value};`);
    }
    css.push("}", "");
  }
  return css.join("\n");
}

const websiteAliases = `[data-meridian] {
  --md-font-display: var(--md-typography-h1-family);
  --md-font-body: var(--md-typography-reading-family);
  --md-font-reading: var(--md-typography-reading-family);
  --md-font-label: var(--md-typography-button-family);
  --md-font-code: var(--md-typography-code-family);
  --md-motion-hover: var(--md-motion-duration-hover);
  --md-motion-button: var(--md-motion-duration-release);
  --md-ease: var(--md-motion-easing-settle);
  color-scheme: light;
}
[data-meridian][data-theme="dark"] { color-scheme: dark; }
`;

export function websiteCss(bundle) {
  return (
    "/* Generated from design/figma/generated/tokens.json; do not edit. */\n" +
    tokenCss(bundle)
      .split("\n")
      .slice(1)
      .join("\n")
      .replaceAll("--meridian-", "--md-") +
    "\n" +
    websiteAliases
  );
}
