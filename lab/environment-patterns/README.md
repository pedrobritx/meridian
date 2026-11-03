# Environment Patterns — Meridian 0.6 Lab

**Status:** isolated experimental Lab page, **not a stable component API**. It implements the Meridian / Living Environments implementation contract (handoff, 2026-11-01) on top of existing sources and changes no stable 0.5 token, selector, Figma master or product adapter.

## What it shows

1. **Forest first:** one shared fixture (stable `.md-button`, `.md-field`/`.md-input`, `.md-card`, `.md-alert`, `.md-badge` recipes plus a segmented control) in Forest Dawn and Dusk.
2. **Resolve a context:** independent Environment, Appearance (System/Dawn/Dusk), Product identity, Material and Motion settings, the resolved boundary markup and any identity warnings.
3. **Six environments × Dawn/Dusk:** the same fixture in all twelve canonical appearances from `design/meridian/living-environments.json`.
4. **Accessibility overrides decoration:** Aurora Dusk with glass, expressive motion and full ambient light beside the same request under reduced transparency and reduced motion.

## Evidence labels

| Label | What |
| --- | --- |
| Existing | `living-environments.json` palettes, generated `styles/living-environments.css`, stable `styles/tokens.css` and `styles/components.css` recipes, 0.5 profile tokens used for identities |
| Proposed | `resolve.mjs` (appearance policy, identity validation, accessibility precedence), `identities.mjs`, `material.css` (atmosphere, acrylic, liquid lens, segmented lens, motion grammar), `data-material` / `data-motion` boundary attributes |
| Unvalidated | glass over real imagery, VoiceOver/NVDA, Safari/Firefox compositing, device performance, participant evidence (issue #12) |

## Files

- `resolve.mjs` — pure resolution model. Brand overrides apply only when on-primary/primary, hover, secondary text and the action boundary pass in that environment and appearance.
- `identities.mjs` — Lexis (Paper) and Verbalis (Parallel) accents derived from `design/figma/generated/tokens.json`.
- `material.css` — Lab-only material layer. Opaque is the default; `data-material="glass"` opts in. Reduced transparency, increased contrast, forced colours and missing `backdrop-filter` force opaque; reduced motion removes springs.
- `patterns.css` — page layout; semantic roles only.

## Checks

`tests/environment-patterns.test.mjs` (resolver, identity contrast in all twelve appearances, rejection of a weak brand, accessibility precedence, `.dark` parity, no raw colours) and `tests/browser/environment-patterns.spec.js` (identical fixture DOM and card height in twelve appearances, Forest values, independent settings, OS reduced motion, keyboard radios, axe AA, no horizontal scroll).
