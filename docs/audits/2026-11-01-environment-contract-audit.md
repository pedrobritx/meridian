> Historical audit supplied with the Environment Patterns bundle. Its five-family inventory describes the earlier baseline. See [the current six-environment migration](../migration/2026-11-03-six-environments.md) for implementation and live Figma evidence.

# Environment contract audit — 1 November 2026

**Scope:** `pedrobritx/meridian` at `main@d16ad61` against the *Meridian / Living Environments — Claude Implementation Contract* (handoff, 2026-11-01) and its visual atlas.
**Labels:** EXISTING (verifiable in source), PROPOSED (this change set, needs review), UNVALIDATED (needs human, device or assistive-technology evidence).
**Status of this change set:** local branch `lab/environment-patterns`, not committed, not pushed, nothing published to Figma.

## Verified (EXISTING)

| Check | Result |
| --- | --- |
| Manifest schema 1, five IDs in fixed order, Dawn/Dusk, 39 identical roles | Pass (`tests/environment-contract.test.mjs`) |
| Forest = Grass and Desert = Paper, every colour role | Pass |
| Generated `styles/living-environments.css` matches the generator; build leaves the tree clean | Pass |
| Extended contrast: 36 opaque pairs × 10 modes (text on page/sunken/overlay, muted, links, action-secondary, destructive, hover/active labels, status text on status and surface backgrounds, control borders and focus 3:1, action boundary 3:1, glass and button-glass composited over page, disabled 3:1) | 360 of 360 pass |
| `styles/components.css` uses semantic roles only, no raw colours | Pass |
| Stable 0.5 selectors, mode IDs, Figma IDs | Unchanged |

## Discrepancies

| # | Finding | Severity | Action |
| --- | --- | --- | --- |
| D1 | The environment CSS ignored the stable `.dark` class boundary. `data-meridian="grass" class="dark" data-meridian-environment="forest"` resolved the 0.5 profile as Dusk but the environment as **Dawn** (`--md-color-bg-page` was `#F4F6F2`). | High for adopters using `.dark` | **Fixed (PROPOSED):** generator adds a `.dark:not([data-theme="light"])` Dusk selector; CSS regenerated; test added. |
| D2 | Stable 0.5: a `.dark` boundary keeps `color-scheme: light`, because only `[data-meridian][data-theme="dark"]` sets `dark`. Native controls render light inside a dark profile. | Medium | Reported only; stable 0.5 output not changed. Suggested fix: add `[data-meridian].dark:not([data-theme="light"])` to that rule in `scripts/build-tokens.mjs`. |
| D3 | The four `ambient/*` roles are generated but no recipe or page consumes `--md-env-*`. | Gap | Consumed by the Lab material layer only (PROPOSED). |
| D4 | The Universal Library Lab renders environment specimens with its own `.u-*` styles instead of `styles/components.css`, so its previews are not the shared masters the contract asks for. | Medium | Reported. The new Environment Patterns Lab uses the stable recipes. |
| D5 | The Forest reference Lab uses a hand-authored `--fr-*` palette (page `#EDF1E6`, action `#22583E`) instead of canonical Forest (`#F4F6F2`, `#235D50`). It is the contract's "most complete Forest specimen" but not on the canonical tokens. | Medium | Reported. Recommend migrating it to `--md-color-*` roles in a separate change. |
| D6 | Stable recipe: `.md-input`, `.md-select`, `.md-textarea` are `width:100%` with padding and content-box sizing, so they overflow outside a page that sets `box-sizing:border-box` globally. | Low | Worked around inside the Lab only; stable recipe unchanged. Suggested fix: `box-sizing:border-box` on those three selectors. |
| D7 | `data-material`, `data-motion` and System appearance policy are not implemented in stable code. | Expected (contract §6 is PROPOSED) | Implemented Lab-only. |
| D8 | An environment does not inherit into a nested boundary that sets only `data-meridian` / `data-theme`; it reverts to 0.5 colours. | Expected (contract §4) | Documented; nested boundaries must set all attributes. |

## Change set (PROPOSED, Lab)

- `lab/environment-patterns/`: one shared fixture (Button, Text Field, Card, Alert, Badge, segmented control) rendered Forest Dawn/Dusk first, then in all ten modes; interactive resolution of independent Environment, Appearance, Product identity, Material and Motion; accessibility-override comparison.
- `resolve.mjs`: System appearance policy, identity contrast validation (on-primary, hover, secondary text, action boundary), accessibility precedence, ambient clamp.
- `identities.mjs`: Lexis (Paper) and Verbalis (Parallel) accents from the 0.5 tokens; both pass in all ten modes.
- `material.css`: opaque by default; acrylic (blur `--md-blur-liquid`, 160% saturation, tint lit by `ambient/highlight`, grain, specular rim), pointer-local liquid lens, spring segmented lens; opaque under reduced transparency, increased contrast, forced colours and missing `backdrop-filter`; no motion under reduced motion.
- `src/universal/environment-tokens.mjs` + regenerated CSS (D1). `tests/environment-contract.test.mjs` now counts rule blocks (Dusk blocks carry two selectors).

## Checks run locally

- `npm test`: 79 of 79 pass (70 existing, 9 new).
- `npm run build`: clean; new `environmentPatterns` entry.
- `npm run test:browser` (Chromium desktop and iPhone 13 profile): 94 of 94 pass (82 existing, 12 new), including axe WCAG 2.2 AA on the new page and identical fixture DOM and card height across ten modes.

## Not verified (UNVALIDATED)

Screen readers, Safari/Firefox backdrop compositing, glass over real imagery, increased-contrast and forced-colours rendering on real devices, device performance, and participant evidence (issue #12). Meridian 0.6 stays experimental.
