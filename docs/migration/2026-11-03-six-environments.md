# Six environments and material labs

Status: implementation prepared for review; not a 1.0 release.

## Owner direction

The active families are Prism (neutral), Forest (green), Desert (gold), Ocean (blue), Aurora (purple/pink), and Canyon (red/terracotta). Each has Dawn and Dusk. Fluid is shared interaction behavior, not an environment. Natural light and material response should explain hierarchy without displacing content. See [philosophy](../philosophy.md).

## Canonical sources and compatibility

`design/meridian/living-environments.json` defines the six active families, with 35 semantic and four decorative roles in each appearance. `scripts/build-environments.mjs` generates the CSS. The original ten-family manifest is preserved verbatim in `design/meridian/compatibility/environments-2026-11-02.json`.

Core becomes Prism; Embers becomes Canyon. Alpine, Storm and Glacier inform Ocean; Celestial informs Aurora. The retired CSS identifiers keep their original values and are omitted from active pickers. Stable 0.5 Core/Grass/Paper and product profiles are unchanged. The new golden Desert is deliberately different from Paper. Existing `desert` and `aurora` experimental consumers receive the revised palettes and need visual review; do not claim pixel-identical migration for those selectors.

Prism and Forest preserve their earlier canonical role values. Desert, Ocean, Aurora and Canyon use the supplied Material Model direction for primary surfaces and accents, retaining compatible semantic status colors. All twelve canonical appearances pass the defined solid-surface contrast pairs. Translucent compositions still require testing against actual content.

## Supplied experiments

Material Model demonstrates six environments across simulated input/device contexts. Environment Patterns separates environment from stable profile selection. Both are registered build entries and have browser checks. The Material Model is a self-contained exploration with its own palette and physics; it is not a production component package or proof of native watch, spatial or automotive support.

## Live Figma work

The existing file was reorganised in place, preserving component roots and semantic IDs. The seven component purpose pages contain all 62 catalogued roots. Symbols and Lab studies have dedicated pages; top-level moved sections were arranged without overlap. Getting started, Changelog and Templates explain usage and readiness.

The six active Environment modes resolve through Appearance aliases into hidden primitives. All 468 values were compared against the canonical manifest with no differences. Core and Embers mode IDs now display Prism and Canyon; the four retired modes are labelled Legacy. The existing collection default remains Forest to avoid changing inherited designs; explicitly select Prism for new work. The contact-duration alias now points to an 80 ms primitive in every Motion mode. Stable 0.5 collections were not migrated.

Evidence: `design/figma/migrations/2026-11-03-live-verification.json`, per-environment sync records, component-move records and library-guidance records. These describe live changes; older exports and migration maps retain their historical provenance. Additional material/symbol roles outside the 39-role manifest have not been certified as six-environment equivalents.

## Remaining acceptance

- Inspect the final website and live Figma compositions, including materials over real content.
- Complete the named-version export and plugin round trip; verify aliases after the round trip.
- Complete the separate Website/Lab Figma-file migration with component references preserved. No source pages have been deleted.
- Perform the human keyboard/screen-reader/device evaluation tracked by issue #12 before release claims.
- Review the six environments as visual candidates before publication. Automated contrast results do not constitute full accessibility certification.

The component website now includes purpose, usage, accessibility and HTML starting points for all catalogued entries. Composite controls still require a complete interaction controller and product validation; documentation examples are explicitly labelled accordingly.

## Validation evidence

On 3 November 2026, all 106 unit checks passed. The production build and 126 Chromium desktop/mobile browser cases passed before the dependency update. Against Vite 7.3.7, 125 passed and the Canyon Dawn axe scan timed out; that exact case then passed three isolated repetitions (2.3–2.4 seconds each). No accessibility violation was reported, but the timeout remains recorded rather than claiming an uninterrupted green run. The dependency audit reports zero known vulnerabilities after that patch. Visual review covered the relocated Actions composition and the three new guidance frames in Figma. This does not replace browser-engine or real-device acceptance.

A fresh read-only execution of the actual plugin capture code also verified all 2,016 stable-profile values (168 roles × 12 appearances), with no differences at numeric tolerance 0.000001. See `2026-11-03-stable-profile-verification.json`. This establishes capture compatibility and stable-profile parity; it does not prove the installed plugin UI, import or publication round trip.

Extended browser review: WebKit passed 61 cases and exposed a dialog focus-restoration defect plus a Chromium-only emulation test. The dialog now explicitly restores focus to its opener; the corrected tests passed in Chromium and WebKit (five passes, one explicitly unsupported media-emulation skip). Firefox failed before page creation because its downloaded macOS build could not locate an existing profile folder, including with a dedicated temporary profile. Linux CI now installs all three engines to complete the engine checks independently of that local launch failure.

Two actionable findings from the supplied historical audit are repaired: standalone input/select/textarea recipes now include their own border-box sizing, and the stable `.dark` selector sets the native control color scheme while respecting explicit light appearance. A test without the reference-site reset passed in Chromium and WebKit; all 106 unit checks still pass.

## File ownership and saved version

Pedro saved named version `2417769680861415862` in the main library. The existing sync job was rerun to export it; the outcome is tracked separately from the saved-version confirmation.

The existing [Website file](https://www.figma.com/design/t8af32zfCQTsfIygmivuwi/Meridian-Website) contains five designed pages and is preserved. Its cover now reflects the owner’s natural-material direction and current website address. The new [Lab copy](https://www.figma.com/design/vX1eNJVAJ7QLqjimSvcGmm/Meridian-Lab) puts Studies and Archive first, with copied dependency pages labelled Reference. Those references are snapshots, not a second published library. The discovered Web Design Library file is empty and was left untouched. `2026-11-03-file-ownership.json` records IDs and edits.

This establishes the destination files without deleting source pages. Migrating existing source links and replacing copied local dependencies with verified library references remains necessary before pruning anything.

The first Linux three-engine CI run passed 237 cases and found 21 forced-click failures on clipped native inputs in the Material Model tests. Tests now click the visible native labels and assert the resulting input state. All 30 affected Chromium/WebKit cases passed locally; the next CI run verifies Firefox and Linux WebKit.
