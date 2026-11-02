# Phase 1: Figma and GitHub drift reconciled (2026-11-01)

- **Rule:** ADR-0002 §7. Figma's newer value wins if it passes the checks, then becomes the GitHub source. A value that fails stays as it is in GitHub until it is corrected in Figma.
- **Input:** `design/figma-export/DIFF.md` (Figma state read on 2026-11-01).
- **Branch:** `sync/phase-1-drift`, stacked on `plan/meridian-1.0`.
- **Labels:** EXISTING = read from Figma or the repo. DECIDED = ADR-0002. PROPOSED = needs your review. UNVALIDATED = not checked.

## Outcome per finding

### Motion (72 mismatches)

| Token, all twelve appearances | Before | Figma | Outcome | Check |
| --- | --- | --- | --- | --- |
| `motion/duration/hover` | 140 ms | 120 ms | Accepted | Passes |
| `motion/duration/release` | 220 ms | 380 ms | Accepted | Passes: release settles after contact |
| `motion/duration/reduced` | 0 ms | 80 ms | Accepted | Passes: reduced-motion CSS still removes transitions and transforms, so this token moves nothing |
| `motion/scale/pressed` | 0.98 Grass, 0.99 Paper, 1 others | 0.985 | Accepted | Passes |
| `motion/translate/hover` | 2 px Grass and Paper, 0 others | 1 px | Accepted | Passes |
| `motion/duration/contact` | 80 ms | 120 ms | **Kept at 80 ms** | Figma fails "contact at or below 100 ms" (governance: "Immediate contact, gentle settling") |

Behaviour change to review: profiles no longer differ in press scale or hover lift. Core, Parallel, Canvas and Gallery used to have neither; they now press to 0.985 and lift 1 px. Profiles still differ in easing, shape and typography.

### Environments (25 mismatches, five missing environments)

| Environment | Outcome | Reason |
| --- | --- | --- |
| Core, Ocean, Alpine, Storm, Celestial | **Added** with Figma's resolved values | All 144 contrast pairs pass in each |
| Glacier, Embers | Glass alpha accepted (`B8` Dawn, `D1` Dusk) | No check covers `color/material/glass`; legibility over a real backdrop is UNVALIDATED, so glass stays Preview (ADR-0002 §5) |
| Desert | **Glass alpha kept** (`E5`, `E0`) | Fails an existing check: Desert must equal Paper 0.5, and Figma's own 0.5 Paper still uses the higher alpha |
| Aurora | **Palette kept**, status Preview | Figma's violet palette fails Dawn link on sunken (4.15:1). The current palette fails the same pair (4.28:1), so this is an existing defect, now recorded |
| Forest | No change | Already matched |

### New automated checks

- `tests/motion-checks.test.mjs`: contact at or below 100 ms in every appearance; reduced motion removes transitions, animation and press transforms.
- `environmentContrastPairs` (`src/universal/environment-tokens.mjs`) applies the pair set of `scripts/build-contrast-report.mjs` to each environment: 72 pairs per appearance, including button glass composited over every surface and over black and white. `tests/environment-contract.test.mjs` requires `status: candidate` when all pass, and `status: preview` with the exact failures listed otherwise. Result: nine candidates, Aurora preview.
- `design/figma/generated/provenance-overrides.json`: `figma-source.json` is the 2026-10-08 native capture. The contract test applies these recorded overrides and fails if one becomes stale.

## Found while doing this (EXISTING)

1. **The plugin's token sync cannot read the current Figma file.** Its token capture treats every collection named `Meridian / ...` as a 0.5 semantic collection. The 0.6 collections (Environment, Appearance, Material, Icon Foreground, Living Environments · 0.6) have no profile modes, so capture throws `Missing profile mode in Meridian / Living Environments · 0.6`. I confirmed this by running the repo's capture function on the exported collection structure; the plugin bundle contains the same code. I did not run it inside Figma. This explains why Figma moved ahead of GitHub.
2. **Nine motion tokens exist only in Figma.** Even limited to the 0.5 collections, capture finds `motion/liquid/*` (feedback, morph, settle, reduced, spring mass, stiffness and damping, pressed scale, hover translate). The plugin import refuses a token set whose names differ.
3. **Correction to `DIFF.md`:** Ocean, Alpine, Storm and Celestial do exist in the repo as hand-authored Lab palettes (`lab/living-environments/environments.js`, LM-H07) with a different role schema. They are not the Figma palettes, so this phase did not use them.
4. **Correction to `DIFF.md`:** its Aurora table checked links against the page only. Against the full pair set, Aurora Dawn link on sunken fails in both palettes.

## Needed in Figma (not done: Figma edits need your approval)

| # | Change | Why |
| --- | --- | --- |
| F1 | Give `motion/duration/contact` (`VariableID:42:99`) its own 80 ms value instead of aliasing `motion/liquid/duration/feedback`, which hover also uses | Until then the plugin import refuses: "Shared alias has conflicting values" |
| F2 | Raise Aurora Dawn link contrast on sunken to at least 4.5:1 (darker `aurora/color/link/default`, or a lighter sunken) | Aurora can then move from preview to candidate and the violet palette can come in |
| F3 | Decide on Desert glass: restore Paper's alpha in Figma, or retire the rule "Desert equals Paper" | Figma currently breaks its own rule |

## Repo follow-ups (phase 2)

- Limit the plugin's 0.5 token capture to the 0.5 collections, and decide whether the nine `motion/liquid/*` tokens join `tokens.json`. Then rebuild the plugin, re-capture `figma-source.json` and drop the overrides.
- Expose the new environments on the website once phase 5 starts; today only the Universal Lab picker lists them.

## Verification

- `npm test`: 73 of 73 pass. Each new check was also run against a deliberately broken value and failed as expected, then passed again on the real data.
- `npx playwright test`: 82 of 82 pass (desktop and mobile, including the axe AA audits and the Lab picker with twenty modes).
- Recomputed against the export after the change: the only remaining differences from Figma are the three holds above (contact in 12 cells, Aurora in 19, Desert glass in 2).
- Not verified: the plugin inside Figma; glass legibility over real backdrops.
