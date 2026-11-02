# Figma reorganisation for Meridian 1.0 (prepared 2026-11-01, not yet applied)

- **Decisions:** ADR-0002 §2 (library, website and lab files), §5 (stable core plus Preview), §8 (Archive moves to the lab file).
- **Plan:** `docs/roadmap/1.0-library-and-site.md` §2.2 (library pages) and §2.3 (component groups).
- **Map and scripts:** `design/figma/migrations/2026-11-01-reorganise/` (`map.json`, steps `01` to `05`).
- **Status:** PROPOSED. The scripts are written and checked against the current file structure (read on 2026-11-01). No Figma write has run yet, because the permission request for Figma edits went unanswered.

## Rule

Every move reparents a node within the same file, so node IDs and component keys stay the same and nothing that links to them breaks. Nothing is deleted. Content bound for the website and lab files is grouped under `Website /` and `Lab /` pages until it moves.

## Library file after the change

| # | Page | Source |
| --- | --- | --- |
| 1 | Cover | Home (`0:1`), renamed |
| 2 | Getting started | New |
| 3 | Changelog | New |
| 4 | Foundations | Style (`197:34`), renamed: Colour, Elevation, Motion, Shape, Spacing, Typography |
| 5 | Symbols | New: Icons section (`339:357`) with the masters, the four-treatment set and the Living Matter 2.0 catalogue |
| 6 | Components / Overview | Components (`3:208`), renamed: directory and overview topic |
| 7 to 13 | Components / Actions, Selection, Text input, Containment, Navigation, Communication, Data and media | New. All 62 components and sets placed as in roadmap §2.3 (7, 8, 6, 8, 14, 11 and 8) |
| 14 | Templates | New |
| 15, 16 | Website / Develop, Website / Foundations | Develop (`3:211`) and Foundations (`3:207`), renamed |
| 17 | Lab / Studies | New: Liquid Glass environment review (`387:1789`), Living Matter 2.0 review and environment QA |
| 18 | Lab / Archive | Archive (`218:21`), renamed |

Glass components keep "Preview" in their new section names (Navigation / Liquid dock, Toolbar / Glass groups, Popover / Glass actions, Button / Liquid XL).

## Steps

1. `01-pages.js`: create, rename and order the pages.
2. `02-style-page.js`: move Icons to Symbols, and the review frames to Lab / Studies.
3. `03-components-page.js`: seven runs, in the order recorded in `map.json`. Nested components leave their old section before that section moves.
4. `04-layout.js`: lay out each changed page in rows; one call per page.
5. `05-variables.js`: F1 (contact gets its own 80 ms primitive) and F2 (Aurora Dawn link default `#475486`, link hover `#3f4a80`, both existing Aurora colours; all 144 Aurora contrast pairs then pass).
6. Save a named version, "Meridian 1.0 · library pages reorganised", so the change reaches GitHub through `figma-sync.yml`.
7. Re-export, check that every node ID in `map.json` still resolves, and screenshot each changed page.

## Not in this change

- **Website and lab files.** A plugin cannot copy nodes into another file. Proposed method: you duplicate the library file twice in Figma and send me the links; I remove everything except the website pages from one copy and everything except the lab pages from the other. After you approve, the `Website /` and `Lab /` pages come out of the library.
- **Desert glass (F3).** Waiting for your decision.
- **Deletions.** The emptied glass section (`510:2117`) and, later, the pages that move out need your approval first.
- **Directory frames** still describe the old pages; their text is updated after the structure settles.
- **Repo links:** `site/content.json` already points at a page that no longer exists (`92:34`); this belongs to phase 2. Renaming the Archive page keeps the Forest Lab fields valid until the Archive leaves this file.
