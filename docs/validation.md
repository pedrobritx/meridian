# Validation — 0.1.0

Executed locally on 6 October 2026:

- `npm test`: 5 passing checks for both-mode completeness, semantic text/action/status contrast (4.5:1), control/focus contrast (3:1).
- `npm run build`: production static build succeeds; fonts and scripts are served from the same origin.
- `npm run test:browser`: 10 passing Chromium scenarios across desktop and a 390px mobile viewport. Every view is audited in both environments using axe WCAG A/AA tags, and checked for horizontal document overflow and runtime errors.
- Behaviour checks: keyboard tabs (arrows/Home/End), native dialog Escape and focus restoration, required-field error/focus and local validation feedback, theme persistence/system changes, reduced motion.
- Figma: aliases, targeted scopes, code syntax and style families inspected; editable layers and component instances verified; screenshots of all six review pages checked. Construction issues found in initial layout were repaired.

Limits: the mobile run emulates an iPhone-sized viewport in Chromium; it is not a native iOS Safari run. Human screen-reader testing, native Safari/Firefox, zoom and forced-colour usability in those browsers have not been completed. Contrast results apply to solid reference surfaces; actual glass backgrounds need contextual verification. No health, circadian or visual-fatigue benefit is claimed.
