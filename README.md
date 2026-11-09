# Meridian

A humanist material for interfaces: one fluid material, six environments, light that follows the sun, and one interaction grammar across devices.

**1.0.0-alpha.0.** Tokens, generated CSS, physics, the Material Lab and the first components. The rest of the components, the Figma library and the website come next (see the roadmap).

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

## Components

Load `css/components.css` after the tokens and call `enhance(document)` from `src/material.js`. Recipes are in [docs/components.md](docs/components.md); every component is shown in every environment on the [reference page](components/) (`npm run lab`, then open `/components/`).

Ready: button, icon button, segmented control, switch, slider, text field, checkbox and radio, tabs, toolbar, dialog, sheet and menu.

## Change a value

Edit `tokens/meridian.tokens.json`, then:

```sh
npm run build
npm test
npm run test:browser
npm run lab
```

`build` regenerates `css/meridian.css` and `src/tokens.js`; `test:browser` runs the component checks in the installed Google Chrome (run `npm ci` first); `lab` serves the Material Lab at http://127.0.0.1:8765/lab/ and the components at /components/. There are no runtime dependencies; Node 20 or later is enough.

## What the checks guarantee

- Text reaches 4.5:1 on surfaces, on the ground and on resting glass; focus rings and control edges reach 3:1.
- Every glass surface has an opaque fallback: when backdrop filters are unsupported, when reduced transparency is on, and in the Solid tier.
- Reduced motion makes transitions instant.
- Every environment's feel settles within 0.9 s, so what a press does never depends on the environment.
- No blend modes; refraction stays within each context's budget; targets are at least 48 px wherever touch is the main input.
- The generated files match the token source.
- Components have no WCAG 2.2 AA violations in any environment; their text reaches 4.5:1 as rendered, glass included; every target meets its context's size; they work from the keyboard; the fluid settles within 0.9 s; reduced motion makes them jump instead of travel.

## Roadmap

1. Material Lab and review: done.
2. Foundation: done.
3. Twelve core components from the lab: buttons, icon button, segmented control, switch, slider, text field, checkbox and radio, toolbar, sheet, dialog, menu, tabs. In review.
4. Figma library generated from the token source.
5. Website at britx.studio/meridian.
6. First product: Glassfolio, then Lexis.

## Not yet verified

Safari and Firefox, real phones and tablets, screen readers, icons at 16 px, the cost of large frosted panels on a phone, and whether people find the material more intuitive.

Decisions are recorded in [docs/decisions.md](docs/decisions.md).
