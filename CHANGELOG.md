# Changelog

## Unreleased — 2026-11-03 · Six environments and material labs

- Consolidate active environments into Prism, Forest, Desert, Ocean, Aurora and Canyon, each in Dawn/Dusk; retain archived retired selectors and stable 0.5 profiles.
- Integrate the supplied Material Model and Environment Patterns labs, including keyboard, reduced-motion and transparency checks.
- Add the Meridian philosophy page and purpose, accessibility and implementation guidance for all 62 component entries.
- Apply the Figma page reorganisation, bind 468 environment values to the canonical manifest and repair the contact-duration alias. Record live verification separately from historical exports.

## Unreleased — 2026-11-02 · Reduced-transparency check

- Fail CI when a stable library style blurs its backdrop without a `prefers-reduced-transparency` fallback that removes the blur (ADR-0002 §5). Both current glass surfaces, `.md-glass` and `.md-button.glass`, pass.

## Unreleased — 2026-11-02 · Release notes from named versions (phase 6, second increment)

- Turn each named Figma version's description into release notes: shown in the export issue and PR, stored in `changes.json`, and written as a changelog-ready `release-note.md`. `design/figma/README.md` gives a three-line description template.

## Unreleased — 2026-11-02 · Component pages (phase 5, second increment)

- Give every Figma library component its own page on the website, with Overview, Specs and Guidelines tabs. Guidelines come from `design/meridian/components.json` where they exist (28 components) and say plainly when they have not been written yet.

## Unreleased — 2026-11-02 · Symbol SVG export (phase 6, first increment)

- Export one SVG per variant of every `Symbol / …` component set at each named Figma version, into `design/figma-export/icons/svg/`, with an index of anything Figma could not render. Unsafe SVG content is rejected.

## Unreleased — 2026-11-02 · Website pages from the library (phase 5, first increment)

- Add Environments, Figma library and Changelog pages to the website, built from the committed Figma export, the environment manifest and this changelog. All ten environments show status and contrast; all 62 Figma components appear in seven purpose groups with their Figma render and a link into Figma.
- Record each component's group in the reorganisation map, so Figma and the website share one grouping.

## Unreleased — 2026-11-02 · Token migration groundwork (phase 3)

- Add the 1.0 deprecation table (`design/meridian/deprecations.json`, `docs/migration/1.0-token-migration.md`): 0.5 profile colours alias to Forest, Desert and Core environments; project profiles move to their products; `--meridian-*` gives way to `--md-*`. Nothing is removed before 2.0.
- Run the 864-pair 0.5 contrast check in CI and require the committed contrast evidence to be reproducible.
- Test that the Core environment keeps Core 0.5 colours apart from the documented glass alpha.
- Document how products build their own themes with Meridian (`docs/theming.md`).

## Unreleased — 2026-11-02 · Sync and links repaired (phase 2)

- Fix the plugin's token capture, which failed on the 0.6 collections in the Figma file; capture now reads the 0.5 contract collections only and treats `motion/liquid/*` as internal. Reload the development plugin to use it.
- Confirm read-only that Figma and `tokens.json` agree on 167 of 168 tokens; motion contact remains the deliberate hold (fix F1).
- Keep the token provenance ledger exact automatically, in plugin publication PRs and after GitHub edits.
- Check all 490 referenced Figma node IDs (15 missing, 117 archived), replace 12 archived preview frames, correct the site copy page ID, mark three historical manifests and enforce the link policy in tests and in every named-version export.

## Unreleased — 2026-11-01 · Figma drift reconciled (phase 1)

- Export the current Figma file read-only into `design/figma-export/` with a diff against the repo, and record the 1.0 decisions in ADR-0002 and `docs/roadmap/1.0-library-and-site.md`.
- Accept Figma's newer motion: hover 120 ms, release 380 ms, reduced 80 ms, pressed scale 0.985 and hover lift 1 px in every profile. Contact stays at 80 ms because Figma's 120 ms fails the immediate-contact check. Profiles no longer differ in press scale or hover lift.
- Add the Core, Ocean, Alpine, Storm and Celestial environments from Figma, accept the lower glass alpha for Glacier and Embers, keep Desert equal to Paper and keep Aurora's palette (Figma's violet version fails Dawn link contrast on sunken).
- Gate environments on the full contrast pair set: nine are candidates; Aurora is preview with its failure recorded. Add motion checks and a recorded provenance-override list.
- Record the reconciliation, the plugin's current inability to read 0.6 collections and the Figma fixes still needed in `docs/migration/2026-11-01-phase-1-drift.md`.

## Unreleased — 2026-10-16

- Describe optional Constellation composition with a declarative discipline manifest.
- Move unused 0.1 token/inventory snapshots into archive/0.1; preserve stable 0.5 and experimental 0.6 sources.
- Correct malformed Lab footer markup, remove an empty CSS import and align JSON import attributes to eliminate existing build warnings.


## 0.5 — 8 October 2026 · Purposeful profiles

- Add neutral Core, green Grass and sand/wine Paper organisation, plus repository-informed Parallel (Verbalis CAT), Canvas (NotUX whiteboard) and Gallery (Framio museum). Retain Lexis’s editorial identity; document Ambientis Grass/Terra as a proposal.
- Export twelve appearances with profile typography, code/terminology font roles, shape and motion. Split native colour collections at Figma’s ten-mode limit while retaining existing mode IDs and aliases.
- Add native liquid-glass and opaque seven-state buttons, functional project symbols and five editable project specimens with Start navigation. Implement protective glass, preference fallbacks and keyboard behaviour in the reference site.
- Save native provenance, mapped Figma copy, generated CSS/plugin bundles and contrast evidence together in Meridian.

## Unreleased — website 0.4 and two-way shared contract

- Replace the website's separate 0.1 token source with the canonical four-mode Core/Grass/Paper library, profile controls and shared Figma copy.
- Align readable foreground/surface pairs, 24px controls/list feedback, selected-only bold segments and profile press/motion behaviour.
- Add alias-preserving native imports and optional live synchronization of tokens and ten mapped text layers while the plugin is open. Stop concurrent edits instead of overwriting them.
- Publish Figma changes as draft PRs with current website CSS; merging into main validates and deploys Pages. Layouts/prototypes remain visual handoff artifacts.
- Named-version delivery was verified in merged export PR #3. A new 0.4 named version and updated plugin session are required for the current contract.

## Earlier — Figma library 0.4 and dedicated repository sync

- Record the current Core/Grass/Paper native library, four-mode semantic tokens, generated reference CSS, inventory and interaction evidence in Meridian's own repository.
- Add named-version polling/manual sync, draft PR/issue handoff, explicit native-token publication, and an optional authenticated webhook receiver. All publication routes target `pedrobritx/meridian`.
- Preserve and label the existing 0.1 web implementation and its original source map. This first bridge revision retained the 0.1 website. Webhook deployment remains optional and unverified.

## 0.1.0 — 6 October 2026

First implemented web reference and editable Figma library: paired Dawn/Dusk semantic colours, layout/type/material foundations, twelve symbols, nine core component families, responsive reading/preferences/workspace patterns, and product adaptation guidance. Static GitHub Pages deployment with contrast and browser checks. Existing products remain unchanged.
