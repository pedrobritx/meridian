# Validation — Meridian 0.5

Executed locally on 8 October 2026:

- `npm test`: 46 passing checks for twelve-mode parity, exact native snapshot equality, generated CSS, alias-preserving imports, opaque/composited contrast, immutable-blob publication, stale-main/conflict protection, mapped text, rollback and sync orchestration.
- `npm run build`: production build succeeds and regenerates both CSS consumers and the importable plugin. Eight font families and their unchanged licences are self-hosted.
- Browser coverage: all seven routes in six profiles × light/dark passed axe A/AA and horizontal-overflow checks at desktop and 390px mobile widths. The full route/keyboard run passed 32 scenarios. After the immediate opaque-fallback fix, the two new glass keyboard/reduced-transparency/forced-colour scenarios passed a targeted rerun. Tabs, dialog focus, local form validation, persistence, row-owned hover and reduced motion are covered.
- `node scripts/build-contrast-report.mjs`: 864 passing pairs. Minimum text contrast is 4.6836:1; minimum control/focus contrast is 3.0024:1. Checks include supported solid surfaces and glass composites over those surfaces plus black/white extremes.
- Figma: five editable project specimens in light/dark, 168 editable text layers and 40 linked instances on the project board; no child overflow. Button sets have 48px targets and valid internal state destinations. Final native screenshots were reviewed; six screenshot artifacts are saved in `design/meridian/previews/`.

Chromium used `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. Native tokens and mapped copy were read from the current live Figma file. The content baseline matches the saved Figma and GitHub source. Layout/component edits persisted through use_figma. The editing API cannot create a named Figma history version; this is a saved current-file update.

The development plugin mutation and publication paths were exercised with mocked native/HTTP APIs. The immutable-blob transport preserves the complete 136KB contract within GitHub’s dispatch limit. An installed plugin session and a new named-version export are separate integration checks; no claim is made that a webhook is active or the review branch is deployed.

Native refraction over arbitrary imagery, human screen-reader checks and Safari/Firefox remain contextual adoption checks. Automated checks are not full WCAG certification. Ambientis Grass/Terra is a proposal based on its documented foundation, not an approved production palette or compliance stamp.
