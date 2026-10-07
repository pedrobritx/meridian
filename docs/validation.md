# Validation — website 0.4

Executed locally on 7 October 2026:

- `npm test`: 43 passing checks for the canonical four-mode contract, generated CSS, contrast, native alias resolution/import, rollback, mapped text, plugin UI, conflict protection, webhook handling and sync CLI orchestration.
- `npm run build`: production static build succeeds. It regenerates both CSS consumers and the importable Figma plugin; Manrope, Fraunces, Newsreader and JetBrains Mono are self-hosted.
- Browser checks: all seven routes passed axe A/AA checks and horizontal-overflow checks in Grass/Paper × light/dark at desktop and 390px mobile widths. Keyboard tabs, native dialog, local form validation, persistence and reduced motion passed. Selected-only bold and row-only rounded hover passed in a subsequent focused run after correcting the test selector (16 scenarios total).
- Browser runs used the environment's `/usr/bin/chromium` through `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; downloading Playwright's bundled browser was blocked. CI installs its bundled Chromium normally.
- Desktop Grass and mobile Paper overview screenshots were reviewed visually.

The plugin UI and native mutation paths were executed with mocked HTTP/native APIs, not a real live plugin session. The earlier named-version export succeeded and was merged in PR #3, but that old named version is not the current 0.4 canvas. Save a new named version and activate the updated plugin to verify the current round trip end to end.

Automated checks are not full WCAG certification. Native Safari/Firefox, human screen-reader checks, and contextual contrast over arbitrary glass imagery remain unverified. Layouts, application code and prototype reaction timing are not reversible through design tokens.

Historical 0.1 verification covered its paired Dawn/Dusk reference, six routes and ten browser scenarios on 6 October 2026. It is superseded by the current contract above.
