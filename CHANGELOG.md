# Changelog

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
