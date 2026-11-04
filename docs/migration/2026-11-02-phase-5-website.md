# Phase 5, first increment: website pages built from the library (2026-11-02)

- **Plan:** `docs/roadmap/1.0-library-and-site.md` §2.1 and phase 5. **Tracker:** #43.
- **Branch:** `site/phase-5-website`, stacked on phase 4 preparation (#46).

## What changed

The Vite site keeps its structure. Three pages are added, and the navigation now has ten entries.

| Page | Content | Source of truth |
| --- | --- | --- |
| Environments | All ten environments: Dawn and Dusk swatches, candidate or Preview status, and contrast results calculated in the browser | `design/meridian/living-environments.json` |
| Figma library | All 62 Figma components and sets in the seven groups from roadmap §2.3. Each card shows the Figma render, variants, properties, status and a link into Figma | `site/library.json`, built by `scripts/build-site-data.mjs` from `design/figma-export/` and the reorganisation map |
| Changelog | `CHANGELOG.md`, rendered through a small Markdown subset that escapes all text first and only links to https addresses | `CHANGELOG.md` |

The reorganisation map now records each component's group (`componentGroups`), so the Figma pages and the website use the same grouping.

## Checks

- `tests/site-data.test.mjs`:
  - `site/library.json` must be reproducible from the export, with all 62 components exactly once, each with a screenshot.
  - The changelog renderer must escape HTML and refuse non-https links.
- The browser test now includes the three new pages. Axe AA and the overflow checks pass in all twelve profile and appearance combinations, on desktop and mobile.

## Not yet done (PROPOSED next increments)

- **Philosophy pages:** these need your own writing, which I haven't attempted.
- **Component pages, Accessibility and Code tabs:** the second increment (`site/phase-5-component-pages`) adds a page per component at `#component/<node-id>` with Overview, Specs and Guidelines tabs. Guidelines reuse `design/meridian/components.json` for 28 components. Accessibility and Code tabs need written guidance per component.
- **Website file in Figma:** waiting for phase 4.
- **Status labels:** on the site, "Candidate" means eligible for stable; no component has had its Definition of ready review yet.
