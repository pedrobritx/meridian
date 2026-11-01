# Figma to repo diff

File `aJ2f6aYX9KBucAdPsCmkXn`, read on 1 November 2026. Repo commit `d16ad61` (main) plus this branch.

Labels: **EXISTING** = read from Figma or the repo. **PROPOSED** = my suggestion, not decided. **UNVALIDATED** = not checked, or checked only heuristically. **DECIDED** appears nowhere in this file: I have not recorded any decision on your behalf.

## Summary

- The stable 0.5 token layer matches. Across 12 modes (Grass, Paper, Core, Parallel, Canvas, Gallery, each Dawn and Dusk), 2,016 token-by-mode pairs from `design/figma/generated/tokens.json` were compared with the resolved Figma values. Colour, layout, typography and elevation are identical. All 72 mismatches are in `motion/*`.
- The 0.6 Environment layer has drifted. Of 390 comparisons against `design/meridian/living-environments.json`, 365 match and 25 differ. Aurora accounts for 19 (its palette changed from teal-green to violet-blue); Desert, Glacier and Embers differ only in glass alpha.
- Figma holds three collections and about 480 primitives that the repo does not reference by name (section 1.1).
- Component comparison covers the Components page only (section 3). Icon names match the repo for the Universal set; icon SVGs are not exported (section 4).

## 1. Tokens

### 1.1 In Figma, missing from the repo (EXISTING)

"Found" is a heuristic: the variable name, or its code syntax, appears anywhere in `styles/`, `design/` (excluding this export), `src/`, `docs/`, `lab/` or `scripts/`. A hit can be a false positive. **UNVALIDATED** for anything below the stated counts.

| Figma collection | Variables | Found by name in repo | Not found |
| --- | ---: | ---: | ---: |
| Meridian / Primitives | 978 | 495 | 483 |
| Meridian / Colour | 35 | 35 | 0 |
| Meridian / Layout | 48 | 48 | 0 |
| Meridian / Typography | 61 | 61 | 0 |
| Meridian / Motion | 19 | 10 | 9 (`motion/liquid/*`) |
| Meridian / Elevation | 14 | 14 | 0 |
| Meridian / Project Colour | 35 | 35 | 0 |
| Meridian 0.6 Lab / Forest | 12 | 12 | 0 |
| Meridian / Living Environments 0.6 | 39 | 39 | 0 |
| Meridian / Environment | 62 | 39 | 23 |
| Meridian / Appearance | 470 | 0 | 470 |
| Meridian / Icon Foreground | 2 | 0 | 2 |
| Meridian / Material | 29 | 0 | 29 |

- **Primitives not found (483):** `environment/swatch/*` 269, `liquid-glass/aurora/*` 78 (all 78 are `hiddenFromPublishing`), `pigment/symbol/*` 48, `liquid-glass/material/*` 40, `material/liquid/*` 20, `optics/material/*` 19, `optics/motion/*` 9.
- **Environment not found (23):** `color/material/layer/*` and `color/material/selection/foreground` (rear, raised, navigation, menu, dialog, selection, front-control, front-selection), `material/symbol/{ceramic,metal,botanical}/{light,body,shade,edge}` and `material/symbol/texture/{wood,sand}`.
- **`tokens.json` names:** Figma has 9 names the 168-name repo contract lacks, all `motion/liquid/*` (duration feedback, morph, settle, reduced; spring mass, stiffness, damping; scale pressed; translate hover).
- **Environments:** Figma defines ten (Forest, Core, Desert, Ocean, Alpine, Storm, Celestial, Aurora, Glacier, Embers). `living-environments.json` and `styles/living-environments.css` define five (forest, desert, aurora, glacier, embers). Core, Ocean, Alpine, Storm and Celestial have no repo definition I could find.

### 1.2 In the repo, missing from Figma (EXISTING)

None found. All 168 names in `tokens.json` exist in Figma, and all 39 roles in `living-environments.json` exist in the Figma Environment collection.

## 2. Value mismatches

### 2.1 Motion: 72 mismatches (6 names across 12 modes) (EXISTING)

Figma's `motion/*` semantic variables now alias the new `motion/liquid/*` values; the repo still carries the older values.

| Token | Repo (`tokens.json`) | Figma (all modes) |
| --- | --- | --- |
| `motion/duration/contact` | 80 | 120 |
| `motion/duration/hover` | 140 | 120 |
| `motion/duration/release` | 220 | 380 |
| `motion/duration/reduced` | 0 | 80 |
| `motion/scale/pressed` | 0.98 (Grass), 0.99 (Paper), 1 (Core, Parallel, Canvas, Gallery) | 0.985 |
| `motion/translate/hover` | 2 (Grass, Paper), 0 (Core, Parallel, Canvas, Gallery) | 1 |

`motion/duration/overlay` (320) and the three easings match. No contrast impact. Reduced-motion impact: the repo's 0 ms becomes 80 ms in Figma.

### 2.2 Environment drift: 25 mismatches (EXISTING), contrast computed (derived)

Contrast is WCAG 2.x, computed from the hex values in each environment and mode; "vs page" is the colour against `color/bg/page` of the same environment and mode. Required: 4.5:1 for text and links, 3:1 for focus rings and control boundaries.

**Desert, Glacier, Embers: `color/material/glass` alpha only (6 mismatches).** Figma lowers the glass fill alpha to 0xB8 (Dawn) and 0xD1 (Dusk) in all three, matching Forest, which the repo already has at that value.

| Env | Mode | Repo | Figma |
| --- | --- | --- | --- |
| Desert | Dawn / Dusk | `#FCF9F2E5` / `#2B241CE0` | `#fcf9f2b8` / `#2b241cd1` |
| Glacier | Dawn / Dusk | `#FFFFFFED` / `#173646ED` | `#ffffffb8` / `#173646d1` |
| Embers | Dawn / Dusk | `#FFFCF8ED` / `#332D2EED` | `#fffcf8b8` / `#332d2ed1` |

Contrast impact: not computable. Legibility over glass depends on the backdrop. **UNVALIDATED.**

**Aurora (19 mismatches).** The repo palette is teal-green; Figma resolves Aurora to a violet-blue palette through the hidden `liquid-glass/aurora/*` primitives.

| Mode | Role | Repo | Figma | Contrast, repo then Figma |
| --- | --- | --- | --- | --- |
| Dawn | action/primary | `#39796B` | `#59639c` | vs page 4.67 then 5.22; white on-primary 5.10 then 5.69 |
| Dawn | action/hover | `#1C5E55` | `#475486` | vs page 6.92 then 6.68; on-primary 7.55 then 7.29 |
| Dawn | action/secondary | `#244F4A` | `#475486` | vs page 8.39 then 6.68; on-primary 9.16 then 7.29 |
| Dawn | action/active | `#174C46` | `#3f4a80` | vs page 8.91 then 7.69; on-primary 9.73 then 8.39 |
| Dawn | focus/ring | `#295F59` | `#59639c` | vs page 6.69 then 5.22 (3:1 required) |
| Dawn | link/default | `#39796B` | `#59639c` | vs page 4.67 then 5.22 |
| Dawn | link/hover | `#1C5E55` | `#475486` | vs page 6.92 then 6.68 |
| Dawn | bg/sunken | `#E7EBF9` | `#d7dbf4` | muted text on sunken 5.21 then **4.53** (4.5 required; margin 0.03) |
| Dawn | ambient/highlight | `#B5FFE1` | `#b9b5e9` | decorative |
| Dusk | action/primary | `#90EEC6` | `#bbc3f3` | vs page 13.11 then 10.51; on-primary 11.58 then 9.28 |
| Dusk | action/hover, active, focus/ring, link/hover | `#B2FBDC` | `#d5dbff` | vs page 15.26 then 13.26 |
| Dusk | action/secondary, link/default | `#90EEC6` | `#bbc3f3` | vs page 13.11 then 10.51 |
| Dusk | bg/sunken | `#0C1025` | `#252e59` | muted text on sunken 10.77 then 7.45 |
| Dusk | ambient/highlight, glow | `#6DECC9`, `#B858B3` | `#6f4f96`, `#9c6fbb` | decorative |

Every text, link, focus and on-primary pair stays above its required ratio in the Figma values. The only thin margin is Aurora Dawn muted text on the sunken surface (4.53 against 4.5).

### 2.3 What matched (EXISTING)

- 1,944 of 2,016 token-by-mode pairs match (the 72 in 2.1 are the exception), including every colour in all 12 modes, so there is no contrast change on the stable 0.5 layer.
- 365 of 390 environment-role comparisons match, including all Forest values.
- Mode names, mode IDs, collection IDs, collection keys and variable IDs are untouched in the repo; this branch only adds `design/figma-export/`.

## 3. Components (partial)

**Scope read:** the Components page (`3:208`) only. 62 top-level component sets and standalone components (402 component nodes including variants), all with a default-variant screenshot. The Style (`197:34`), Archive (`218:21`), Foundations (`3:207`), Home and Develop pages were not inventoried. Variable bindings inside components were not extracted.

**Figma components with no dedicated repo recipe (EXISTING, judged by name and by grep):**
- Segmented control
- Navigation / Liquid dock
- Button / Liquid XL
- Toolbar / Glass groups (only loosely covered by `universal-core-a` toolbar entries)
- Popover / Glass actions (only loosely covered by a `universal-core-a` popover entry)

**Covered only loosely, so the mapping is a judgement call:** Card / Content and Card / Stateful map to the single `Card` recipe; Calendar panel is described inside the Date picker recipe; Meridian / List item maps to `List`; Navigation item maps to the `docs/components.md` table rather than `components.json`.

**Repo recipes with no Figma master on the Components page:** `Button / Glass` (the Figma side has `Button` plus glass effect styles and `Button / Liquid XL`).

**Universal families:** the repo lists 92 across `universal-core-a`, `universal-core-b`, `universal-extended` and `universal-project-patterns`. Figma's Components page holds 16 `Universal / ...` sets. The other 69 repo families have no master there, probably because they live on the Style page. **UNVALIDATED.**

## 4. Icons and marks (names compared, SVG files not exported)

**EXISTING:** the Style page (`197:34`) holds 104 symbol component sets with 434 variants, each 24 by 24. See `icons/inventory.json`.

- **Universal icon set (80 sets, section `339:869`):** the names are identical to the 80 icons in `design/meridian/universal-symbols.json`. No icons added, removed or renamed.
- **Masters (24 sets, section `339:867`):** meridian (the mark), compass, sun, moon, arrow, check, warning, info, close, book, layers and leaf are all in `src/icons.js`. segments, pen, frame, evidence, water and reconcile are all in `design/meridian/project-symbols.json`. Six are in Figma but in neither file: calendar, chevron-down, chevron-left, chevron-right, search and sort.
- **Treatments:** every set has Outline, Filled, Colour and Duotone. Eighteen also have a Material variant (11 Universal, 7 masters). The repo defines one stroke style (24 viewBox, stroke width 1.7), so the other treatments have no repo counterpart. Geometry was not compared. **UNVALIDATED.**
- **Meridian mark:** set `Symbol / meridian` (`449:9397`). The repo has `assets/meridian.svg` and the `meridian` path in `src/icons.js`. Geometry not compared. **UNVALIDATED.**
- **Why no SVG files:** the bulk asset download returns de-duplicated vector lists per set, so they cannot be mapped to variants reliably. A correct export needs one export per variant (434 calls).

## 5. Questions for you

1. **Motion.** Which side is canonical for 0.5? Figma's contact/hover/release/reduced values (120/120/380/80) differ from `tokens.json`. Your rule says not to change canonical tokens, so I changed nothing. **PROPOSED:** treat Figma as the newer intent only if you confirm, then regenerate `tokens.json` in a separate change.
2. **Reduced motion.** Is 80 ms the intended `motion/duration/reduced`, or should it stay 0?
3. **Aurora.** Is the violet-blue palette intended for 0.6? The repo's Aurora is teal-green and `living-environments.json` is marked `experimental-until-reviewed`.
4. **Glass alpha.** Is unifying Desert, Glacier and Embers glass to the Forest alpha intended?
5. **Missing environments.** Should Core, Ocean, Alpine, Storm and Celestial be added to `living-environments.json` and the CSS? The modePolicy in that file already says ten modes.
6. **Figma-only collections.** Appearance (470), Icon Foreground (2) and Material (29) have no repo counterpart. Are they meant to be exported to code, or do they stay design-side?
7. **Hidden primitives.** The 78 `liquid-glass/aurora/*` primitives are `hiddenFromPublishing`. Is Aurora meant to stay out of published libraries?
8. **Where do the 69 other Universal families live?** Please confirm they are on the Style page so I can inventory it.
9. **Icon SVGs.** Do you want all 434 variant SVGs exported as a follow-up? It needs one export call per variant. Should the Colour, Duotone and Material treatments get repo counterparts, or stay design-side?
10. **Six masters outside the repo icon files.** Are calendar, chevron-down, chevron-left, chevron-right, search and sort meant to join `src/icons.js`, or live elsewhere?

## 6. Not read

See `README.md`, "Not exported".
