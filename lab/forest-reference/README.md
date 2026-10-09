# Forest-first reference — Meridian 0.6 Living Matter

**Status:** Isolated experimental Lab reference, **not a stable component API**. This page extends the Living Environments experiment with a complete Forest Dawn/Dusk slice. It does not change Meridian 0.5 tokens, generated Figma modes, shipped components or consuming applications.

## Run

From the repository root:

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

Open `/meridian/lab/forest-reference/` via the dev server or the deployed reference after branch review and merge.

## Included

- Distinct Forest Dawn and **twilight-like, non-black Dusk** palettes with tested *opaque* text, secondary copy and action-label contrast.
- Native radio/task actions, rounded focus feedback, textured atmospheric layers and tactile but optional button motion.
- Independent appearance (system/Dawn/Dusk), decorative illumination, layered/quiet atmosphere and motion controls; local-only optional preference persistence and reset.
- Opaque-first material presentation; system forced colours, increased contrast, reduced transparency and reduced motion constrain the effective treatment.
- A **simulated**, in-memory notification centre: actionable view first, secondary accessible history; unread and pending counters remain separate; all-clear reflects actionable issues only.
- An *experimental* encounter timer for visual history browsing, with 1-second exposure and 500-ms brief interruption tolerance, plus explicitly available Mark as read/unread actions.

## Design-system boundary

`forest-model.js` exports illustrative palette/semantic rules. It does **not** create notifications or authoritative state. `main.js` contains a deliberately simple in-memory application mock to demonstrate presentation; data does not persist or sync and no backend/event platform is implied.

Real consumers provide classification, authorised event source/type/timestamps, read and pending state, retention/deletion, event revision, permissions, notification delivery and cross-device reconciliation. Status must not indicate verified success without an originating application's confirmation.

## Accessibility contracts and unresolved research

- Visual exposure and accessibility-navigation are different encounter paths. Inactive/background DOM focus alone must never acknowledge changes.
- Explicit Mark as unread is preserved until deliberate Mark as read or a separately verified resolution action. Cosmetic event-layout edits do not silently create unread updates.
- `forest-model.js` includes pure functions specifying these priorities; the Lab is **not** a production-ready detection or synchronisation engine.
- The visual scrolling detector uses provisional velocity/displacement heuristics and `IntersectionObserver`; no per-input-device calibration or assistive-technology speech-completion detection has been validated.
- Local colour-pair contrast checks do not establish composited translucent contrast or WCAG compliance in real content. Translucency is optional, defaults to opaque and is disabled by relevant operating-system accessibility settings.
- System-aware Dawn/Dusk here follows appearance preference only. Sunrise/sunset approximate geolocation, locale handling and ambient transitions are **not implemented**; they remain a separate privacy-first research item.
- Automated unit/browser audits verify only named technical behaviours. They do not substitute for keyboard/screen-reader/manual Safari/Firefox/touch, real-device performance or participant comparisons.

## Provenance and promotion gates

Source decisions: [evaluation #12 consolidated](../../research/decisions/2026-10-08-evaluation-12-consolidated.md); [requirements-to-evidence crosswalk](../../research/requirements/forest-first-crosswalk.md); [formative protocol](../../research/studies/living-matter-formative-protocol.md).

LM-01–LM-07 **remain Lab-only**. Do not close [evaluation #12](https://github.com/pedrobritx/meridian/issues/12) or promote Forest to stable Core/Design before actual consented human evidence, manual AT/accessibility review, named-hardware performance measurements, and explicit per-experiment BSDL disposition.
