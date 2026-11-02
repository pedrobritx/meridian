# Changelog

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
