# Figma export

Read-only export of the Meridian Figma file (`aJ2f6aYX9KBucAdPsCmkXn`) on 1 November 2026. Nothing in Figma was edited, and no existing repo file was changed. Everything here is labelled **EXISTING** (read from Figma) unless a file says otherwise. Fields described as derived are computed from the export and labelled in place.

See `DIFF.md` for the comparison with the repo.

## Contents

| Path | What | Status |
| --- | --- | --- |
| `variables/index.json` | List of the 14 collections with file names and mode names | EXISTING |
| `variables/NN-*.json` | One file per collection: collection id, key, default mode, every mode (name and id), every variable (id, type, scopes, code syntax, description, hidden flag, value per mode, alias targets) | EXISTING |
| `variables/*.json` field `resolvedByMode` | Aliases followed to a final value. If the chain crosses into a multi-mode collection (Environment into Appearance), the result is keyed by that collection's mode name | derived |
| `styles/text-styles.json` | 43 text styles with variable bindings | EXISTING |
| `styles/effect-styles.json` | 23 effect styles (glass, shadows) with variable bindings | EXISTING |
| `styles/grid-and-paint-styles.json` | Records that the file has no grid and no paint styles | EXISTING |
| `components/inventory-components-page.json` | 62 top-level component sets and standalone components on the Components page: id, frame, variant count, variant properties and values, text/boolean/swap properties | EXISTING |
| `components/screenshots/*.png` | 62 PNGs, one per set (default variant) or standalone component | EXISTING |
| `components/screenshots.json` | Maps each component to its PNG | EXISTING |
| `icons/inventory.json` | 104 symbol sets (80 Universal, 24 masters including the Meridian mark) with set IDs and variant layer names. No SVG files | EXISTING |
| `environments/*.png`, `environments/screenshots.json` | 9 screenshots of the Style page frame "Material / Liquid Glass / Environment review" and its sections (ten environments, Dawn and Dusk, liquid-glass specimens, accessibility specimens) | EXISTING |
| `diff-data.json` | Machine-readable form of the mismatches in `DIFF.md` | derived |
| `verification.json` | Checksums that tie this export to what Figma returned | EXISTING |
| `DIFF.md` | Comparison with the repo, with open questions | derived |

## Counts

- 13 variable collections with data (978 + 35 + 48 + 61 + 19 + 14 + 35 + 12 + 39 + 62 + 470 + 2 + 29 = 1,804 variables) plus one empty default collection named "Collection".
- Mode names are exactly as Figma returns them: Colour has `Grass / Dawn`, `Grass / Dusk`, `Paper / Dawn`, `Paper / Dusk`, `Core / Dawn`, `Core / Dusk`; Project Colour has the same pattern for Parallel, Canvas and Gallery; Layout and Motion have `Grass`, `Paper`, `Core`, `Parallel`, `Canvas`, `Gallery`; Environment has ten environment modes; Appearance has `Dawn` and `Dusk`; Icon Foreground has `Original`, `On primary`, `On destructive`, `Action`, `Disabled`.
- 43 text styles, 23 effect styles.

## How it was read

Figma data was read through the Plugin API with read-only scripts (no node was created, changed or deleted) and screenshots through the Figma screenshot endpoint. Plugin output cannot be saved to disk directly, so each collection was returned in a compact form, rebuilt locally, and checked against a 32-bit FNV-1a checksum that Figma computed over the same data. Every collection, the collection and mode metadata, the styles and the component inventory matched exactly. `verification.json` lists the checksums.

## Not exported

- **Icon SVGs (item 4):** no SVG files. `icons/inventory.json` lists all 104 sets and their variants. The bulk asset download de-duplicates vectors per set, so a correct export needs one call per variant (434).
- **Separate environment pages (item 5):** the file has no per-environment pages for Forest, Desert, Aurora, Glacier or Embers; the old Lab page `218:21` is now the Archive page. The environments and the liquid-glass specimens appear together in the Style page review frame, captured in `environments/`. Other frames in the Archive and the Style page (for example "Symbols / Living Matter 2.0 / Environment QA") were not captured. Extracted values are in the variable files.
- **Component variable bindings:** which variables each component uses internally was not extracted.
- **Other pages:** components on the Style, Archive, Foundations, Home and Develop pages were not inventoried. Only the Develop page's text was read.
- **Glass optics:** Figma does not expose glass refraction and light settings through the Plugin API, so glass effect styles carry radius and shadows only.
- **Screenshots of non-default variants** were not taken.
