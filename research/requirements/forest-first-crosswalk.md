# Meridian 0.6 — Forest-first requirement/evidence crosswalk

**Date:** 2026-10-08 · **Status:** Proposed/reference implementation in isolated Lab; research and accessibility validation pending.  
**Primary source:** [Evaluation #12 decision record](../decisions/2026-10-08-evaluation-12-consolidated.md).  
**Legend:** P explicit preference · I inferred design detail · O informal reported observation · T automated technical check · V requires participant/manual validation. **T never means human-validated.**

| ID | Requirement / hypothesis | Provenance | Lab coverage | Evidence still needed |
|---|---|---|---|---|
| FR-01 | Forest first; retain other environments as Lab studies | P final consolidation, Q1–71 | Dedicated Forest specimen (Dawn/Dusk) | Usability of comparable tasks across variants; LM-H07 |
| FR-02 | Dusk should be natural twilight, not a near-black interface | P, O Core Dusk reported too dark | New lighter Dusk palette (not Core 0.5) | Participant readability and measured contrast across real scenes |
| FR-03 | Essential text, secondary text and action label readable on opaque surfaces | P/O, Q4 | Node contrast ratio assertions, visual surface roles | Actual composited-scene contrast, text scaling, forced colours, devices |
| FR-04 | Material depth and contextual organic lighting without essential opacity dependence | P, Q1–71 | Decorative canopy/light layers and raised controls | Compare against opaque/minimal equivalents; LM-H03/H06/H07 |
| FR-05 | User environment governs appearance; retain product identity and semantic meaning | P, Q52–57 | Reference identity/sample tasks unchanged | Brand adaptation contract, semantic conflict study |
| FR-06 | Appearance, brightness, atmosphere and motion independently adjustable | P, Q1–71 | Lab control settings and local reset | Discoverability, persistence, hierarchy and control clarity |
| FR-07 | System accessibility preferences outrank decorative choices | P, final choice 3–4 | Forced colours, contrast, transparency and motion fallbacks | Named-device settings and manual AT scenarios |
| FR-08 | Focus geometry follows rounded controls and remains discoverable | P/O, Q4 | Rounded focus styles and native elements | Keyboard/manual focus visibility in Dawn/Dusk |
| FR-09 | Contact feedback is tactile but does not gate execution | P, LM-H01/H03 | Visual primary-button hover/press only | Input latency/frame measurements and preference/error comparison |
| FR-10 | Same native task across Dawn/Dusk; no animation-only meaning | P, LM-H07 | Radio selection, Confirm and Reset | User task time/success/errors across modes and effect disabled |
| FR-11 | Workspace all-clear means no *pending actions*, not no unread events | P, Q112–121, Q142 | In-memory sample health component | Confusion/errors interpreting independently varying counters |
| FR-12 | Notification centre actionable first; history secondary, source/type/time present | P, Q74–76, Q139–142 | In-memory sample history under disclosure | Reading/navigation accessibility, task success, AT announcements |
| FR-13 | Historical unread state counts independently from pending state | P, Q75–76, Q142 | Pure model + browser counter tests | Participant comprehension, cross-device reconciliation |
| FR-14 | A genuine encounter is required; inactive retained DOM focus alone is insufficient | P final reconciliation overrides Q157–162 | Model guard + foreground encounter test | Manual AT/navigation, inactive tabs, focus transitions |
| FR-15 | Meaningful visual encounter candidate is 1 s; interruption tolerance candidate 500 ms | P, Q143–153 | Provisional timer and observer in Lab | Real-device speed/distance/scroll calibration, large entries |
| FR-16 | Programmatic transit and rapid scrolling never count as encountered history | P, Q148–153 | Pure guard; example scroll model | Manual scroll-snap/automatic navigation testing and integration |
| FR-17 | Explicit Mark unread must not be silently cleared by a focus/update event | P final consolidation, Q85–87 | Pure guard and explicit sample button | Synced offline/revision/resolution flows |
| FR-18 | Meaningful authoritative event revision can re-open unread; cosmetic layout does not | I reconciliation from Q154–156 | Revision contract helper and tests | Application-revision semantics across real consumers |
| FR-19 | Minimal data retention, explicit delete/revocation, safe previews | P, Q78–100 | Not implemented (application-owned infrastructure) | Product integration security/privacy assessments |
| FR-20 | App-supplied announcement levels, ordered event queue and verified state | P, Q101–110 | Documented contract only, not application service | AT narration, stale/neutral states, status source review |
| FR-21 | Constrained overrides; no silent degradation of core accessible contracts | P final choice 4 | Experimental CSS roles isolated from Core 0.5 | Cross-product adoption review |
| FR-22 | Sunrise/sunset/manual locale, privacy-first environmental transitions | P, Q1–71 | Not implemented; mode uses explicit/system appearance | Privacy, timezone DST and consent testing before coding |
| FR-23 | Official stable promotion must follow human + AT + BSDL evidence | P final choices 3 and 5 | Explicit Lab-only labels, issue #12 remains open | Consent-based observations, reproducible measures and disposition |

## Evidence entry template for each task

Record **requirement ID, experiment ID, session or audit code, exact version/commit, comparison variant, device/OS/browser/input/AT, settings, task/instructions, success/error, timing method, participant reaction recorded separately, observed results, negative cases, limitations, and reviewer/disposition**.

Use [formative protocol](../studies/living-matter-formative-protocol.md) and [observation worksheet](../studies/templates/living-matter-observation.md). No test outcomes are invented by this matrix.

## Open research/release gates

- [ ] Consent-based formative participant sessions and anonymised reproducible findings
- [ ] Manual Safari, Firefox, VoiceOver/NVDA/TalkBack as applicable, keyboard and touch
- [ ] Effective contrast with composite images, opaque alternatives, high/forced contrast, text zoom
- [ ] Native/OS motion/transparency preferences and device interaction equivalents
- [ ] Named-hardware input responsiveness, frame timing, battery/energy only if measured
- [ ] Revised/retained/rejected per-experiment LM-01–LM-07 BSDL decision
- [ ] Explicit reviewer approval before changes to Meridian 0.5 stable tokens/APIs

**Disposition:** Preference phase complete. Technical Lab work may proceed under review; #12 and release #13 stay open until evidence supports their closure.
