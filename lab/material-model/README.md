# Material Model: Meridian Lab

**Status:** Experimental study for the proposed Meridian restart; **not a component package**.
**Experiment:** MM-01 ([registry](../experiments.json)). **Hypotheses:** LM-H06 glass as material hierarchy, LM-H07 environmental familiarity ([registry](../../research/hypotheses/living-matter.md)).
**Review:** *Meridian: material model and critical review* (Claude doc, 2 Nov 2026).

## What it shows

One app (a reading and listening app) rendered in five contexts (Desk, Touch, Wrist, Space and Drive) across six environments (Prism, Forest, Desert, Ocean, Aurora, Canyon), each with Dawn and Dusk.

- **Four layers.** Light → Ground → Content → Instruments. Content is solid and never refracts, warps or ripples.
- **One material, three tiers.** Refract (backdrop bent at the rim; Chromium only), Frost (blur and tint), Solid (opaque, shading kept). Thin glass carries a label lens; thick glass (tint ≥ 0.84) carries text. Glass never stacks on glass.
- **Light.** Each environment sets a key light that drives sheen, rim and shadow. The attention light is local: pointer glow, contact dent and ripple, and one focus ring that travels between controls.
- **Fluid physics.** Five springs (`SPRING` in the page), identical in every environment and context. Direct manipulation follows the finger exactly; springs run only on release and discrete steps.
- **Context rules.** Target sizes, material cap and motion budget per context. Drive locks reading, texture, ripples and travel while the vehicle moves.

`ENV` in `index.html` is the single source for palettes, light and material parameters.

## Run it

```sh
npm ci
npm run dev
# http://127.0.0.1:5173/meridian/lab/material-model/
```

The page is self-contained (no imports, no network requests) and also works opened directly as a file.

## Checks

- `tests/material-model.test.mjs`: role completeness, contrast for 12 palettes (text 7:1 on surfaces; muted text, links and labels 4.5:1; accents, lines and focus 3:1; a modelled glass composite), no blend modes in the material, no per-environment physics.
- `tests/browser/material-model.spec.js`: every context in every environment without page errors, axe WCAG A/AA in Dawn and Dusk, sheet focus and Escape, driving lockouts.

## Known limits

- Real backdrop refraction renders only in Chromium (`backdrop-filter: url()`); other engines receive Frost.
- Any `mix-blend-mode` inside the material isolates its group and stops backdrop sampling in Chromium; the test above enforces its absence.
- Verified in headless Chromium only. Safari, Firefox, real devices, screen readers, frame timing and battery are untested. Nothing here is evidence of human benefit.

## Integration review — 2 November 2026

Integrated alongside the supplied Environment Patterns study on main at `518c99bcf87bc0453de61b8f1e58293739c3f90b`. Newer Figma exports, canonical palettes, motion values and planning documents are preserved. The six-family Material Model palettes remain local proposals; this does not rename the stable token API or migrate consumers.

The integration binds preview actions to the newly rendered device rather than repeatedly attaching handlers to the persistent container. Reopening a settings sheet cancels its pending close timer. Browser accessibility checks now cover all six environments, both appearances and all five contexts in desktop and mobile Chromium projects. On narrow screens, undersized simulated devices are intentionally inert and are not evidence of interactive accessibility on those devices.

The Environment Patterns study now compares the six active canonical families. Its dark-class compatibility fix is generated from the same six-family manifest, with retired selectors retained separately.
