# Meridian

A humanist material for interfaces: one fluid material, six environments, light that follows the sun, and one interaction grammar across devices.

**1.0.0-alpha.0, the foundation.** Tokens, generated CSS, physics and the Material Lab. Components, the Figma library and the website come next (see the roadmap).

## Use it

```html
<html data-env="ocean" data-appearance="dusk" data-context="touch">
  <link rel="stylesheet" href="css/meridian.css">
```

| Attribute | Values | Without it |
|---|---|---|
| `data-env` | `prism`, `forest`, `desert`, `ocean`, `aurora`, `canyon` | Prism |
| `data-appearance` | `dawn`, `dusk` | Follows the system colour scheme |
| `data-context` | `desk`, `touch` | Desk; targets grow to 48 px on any coarse pointer |
| `data-tier="solid"` | Opaque material | The system's reduced-transparency setting does the same |
| `data-motion="reduced"` | Instant transitions | The system's reduced-motion setting does the same |

Put `data-env` and `data-appearance` on the same element, normally `<html>`.

The tokens sit in a cascade layer with no specificity, so a product's own CSS overrides them without `!important`. A product overrides one thing, its accent (`--accent`, `--on-accent`, `--accent-ink`, `--accent-rgb`), and only with values that pass the checks.

In JavaScript, `src/tokens.js` exports the same tokens, `src/fluid.js` the physics and sun model, and `src/contrast.js` the WCAG contrast helpers.

## Change a value

Edit `tokens/meridian.tokens.json`, then:

```sh
npm run build
npm test
npm run lab
```

`build` regenerates `css/meridian.css` and `src/tokens.js`; `lab` serves the Material Lab at http://127.0.0.1:8765/lab/. There are no dependencies; Node 20 or later is enough.

## What the checks guarantee

- Text reaches 4.5:1 on surfaces, on the ground and on resting glass; focus rings and control edges reach 3:1.
- Every glass surface has an opaque fallback: when backdrop filters are unsupported, when reduced transparency is on, and in the Solid tier.
- Reduced motion makes transitions instant.
- Every environment's feel settles within 0.9 s, so what a press does never depends on the environment.
- No blend modes; refraction stays within each context's budget; targets are at least 48 px wherever touch is the main input.
- The generated files match the token source.

## Roadmap

1. Material Lab and review: done.
2. Foundation: this release.
3. Twelve core components from the lab: buttons, icon button, segmented control, switch, slider, text field, checkbox and radio, toolbar, sheet, dialog, menu, tabs.
4. Figma library generated from the token source.
5. Website at britx.studio/meridian.
6. First product: Glassfolio, then Lexis.

## Not yet verified

Safari and Firefox, real phones and tablets, screen readers, icons at 16 px, the cost of large frosted panels on a phone, and whether people find the material more intuitive.

Decisions are recorded in [docs/decisions.md](docs/decisions.md).
