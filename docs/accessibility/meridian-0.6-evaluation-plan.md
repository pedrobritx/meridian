# Meridian 0.6 — Accessibility & Evaluation Programme

**Status:** APPROVED STRATEGY / IMPLEMENTATION PREPARED / MANUAL EXECUTION NOT STARTED  
**Interview:** 2026-10-09 · 7 decisions · sole current evaluator  
**Owner:** Meridian maintainer  
**Tracking:** [Research and accessibility gate #12](https://github.com/pedrobritx/meridian/issues/12) · [milestone #13](https://github.com/pedrobritx/meridian/issues/13)  
**Design baseline:** [Figma 00 Start / Review · 7:2](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=7-2)  
**Related:** [Living Matter formative research protocol](../../research/studies/living-matter-formative-protocol.md) · [technical evidence](../../research/findings/2026-10-08-living-matter-technical-evidence.md) · [universal library map](../../design/meridian/figma-refactor-map.json)

## 1. Seven binding decisions

1. **Solo evaluator now:** The maintainer conducts technical/manual tests; no other participants are claimed. An independent study is deferred, **not waived**.
2. **Cross-platform intended:** macOS/iOS/iPadOS, Windows and Android with representative browsers and assistive technologies, only as each configuration becomes actually available and is logged.
3. **Risk-based hybrid:** Automated checks broadly; manual checks for consequential, complex and changed component behaviour; complete representative journeys; do not attempt an exhaustive factorial product.
4. **Progressive evidence gates:** Target **WCAG 2.2 Level AA** with enhanced usability checks. Solo technical evidence can support an explicitly limited experimental/beta release; **independent accessibility evidence is mandatory for Meridian stable**.
5. **Three journeys:** Editing a document/translation, completing an interactive learning activity, and submitting/recovering environmental evidence.
6. **Evidence-based GitHub tracking:** Findings record tested software/hardware, steps, expected/actual outcomes, severity, WCAG criteria, linked source/Figma, evidence, owner and retest.
7. **Continuous + milestones:** Automated CI checks on every PR; manual changed-component checks as needed; broader cross-platform audits and signed release reports at 0.6, 0.7, 0.8, 0.9 and 1.0.

These are **release policies chosen by Meridian**, not universal legal requirements or findings already observed.

## 2. Scope and boundaries

**Inside scope for 0.6:** the approved original Start design, Figma component specimens, 92 experimental universal families, 80 icon families/four styles, five opt-in environments (Forest, Desert, Aurora, Glacier, Embers) in Dawn/Dusk, the runnable Universal Library, Living Controls, Living Workspace, and Living Environments, and cross-project *reference* journeys. Only runnable/browser implementations can be evaluated for keyboard, AT and runtime behaviour; a static Figma master is a visual/construction specification.

**Outside the 0.6 claim:** certified conformity of Lexis, Verbalis, NotUX, Ambientis, or other separate production products; effectiveness for populations not recruited; full iOS/Android native app accessibility; psychiatric/neurological or circadian benefit; arbitrary background glass accessibility; a universal or legally binding WCAG certificate. Any unimplemented reference journey is marked **PROTOTYPE BLOCKED**, not passed.

**Existing technical baseline (historical, not an exhaustive new audit):** successful [post-PR #28 main validation](https://github.com/pedrobritx/meridian/actions/runs/37987904409) and [Figma bridge checks](https://github.com/pedrobritx/meridian/actions/runs/37987904339). Unit, Chromium-browser, axe-rule, opaque colour-pair and build tests already exist. This does not prove VoiceOver, NVDA, TalkBack, Safari, Firefox, complex composited glass or real participant usability.

## 3. Accessibility standard and enhanced criteria

- **Baseline:** review **every applicable** WCAG 2.2 A and AA success criterion at a defined *evaluated product/process scope*. Follow the [W3C WCAG-EM sampling and reporting methodology](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/): define scope, explore assets, choose representative views and complete processes, evaluate, document.
- **Enhanced Meridian acceptance:** prefer 44–48 CSS-pixel comfortable targets for important touch controls, while assessing WCAG 2.2 **2.5.8 AA** precisely (24×24 CSS pixels *or permitted exceptions*). This larger design target is Meridian guidance, **not** the AA threshold. Check visible and unobscured focus; non-drag alternatives; no keyboard traps; semantic roles/states; reduced motion and transparency; text spacing, zoom/reflow; high contrast/forced colours; error recovery; timeout/notification legibility; accessible authentication where relevant; captions/transcripts and clear instructions.
- **Cognitive usability:** consistent labels and controls, explicit outcomes, limited simultaneous demands, predictable focus and navigation, helpful errors, no colour-only meaning. Track ease and task completion separately from subjective aesthetic preference.
- **Living Matter:** every expressive effect must have an equivalent static/opaque semantic interaction; cosmetic animation must not move hit targets, delay commands, trap focus, or distort essential text. Assess **actual** composited contrast, not just colour-token ratios.
- **AT testing:** use the [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) for composite widget expectations. Prefer native HTML semantics; Figma role labels alone cannot validate screen-reader behaviour.

## 4. Risk model and sample-selection rule

**Risk = impact × exposure × complexity**. Score each dimension 1 (low) to 3 (high), total **1–27**.

| Risk | Priorities | Minimum manual sampling |
| --- | --- | --- |
| **High (12–27)** | Dialog/sheet/focus return; date picker/combobox; editor and shortcuts; file upload and validation; authentication/permission; save/undo/confirmation; selection and drag alternatives | Test each distinct consequential path on at least one actual keyboard+AT combination, one touch configuration, and representative light/dark environment; log exclusions |
| **Medium (5–11)** | Tabs, carousels, sliders, table sorting, forms, toast/live regions, progress, navigation trees | One tested representative per interaction pattern plus changed states and platform spot-checks |
| **Low (1–4)** | Decorative icon styles, card decoration, dividers, static layout | Automated rules plus visual/manual sampling; inspect any text/icon-only meaning |

Always promote a component to **High** when a failure can lose data, conceal permission or state, block completion, mislead a user, or make recovery impossible, regardless of score. Record the actual score and rationale rather than mechanically assigning tiers by name.

**Sampling strategy:** all rendered catalogue routes undergo automated checks where feasible; manually exercise all *distinct high-risk mechanics*, not every permutation of 92 families × 10 appearances × input modes. Use pairwise/representative combinations for medium and low risk; give every one of the ten palettes automated role/contrast checks. Default manual anchors: **Forest Dawn, Forest Dusk, Aurora Dusk, Glacier Dawn, Desert Dawn, Embers Dusk**; add other combinations when a changed contrast, hue, or material creates a new risk. Failure in any environment blocks that scoped configuration.

## 5. Platform and assistive-technology matrix

**Availability is not confirmed.** Before each session, record *actual* device model, OS build, browser version, AT version, viewport, input, settings, date and tested commit. Mark unavailable combinations **NOT RUN**, not failed or passed.

| ID | Planned configuration | Primary task and reason | Initial evidence |
| --- | --- | --- | --- |
| PL-01 | macOS · Safari · VoiceOver · keyboard | Rotor/landmarks, reading order, focus, dialogs and editing | NOT RUN |
| PL-02 | macOS · Chrome/Firefox · keyboard only | Tab order, shortcuts, focus visibility, browser differences | NOT RUN |
| PL-03 | Windows · Chrome/Edge · NVDA · keyboard | Composite widgets, dialogs, announcements, form errors | NOT RUN |
| PL-04 | Windows · Firefox · NVDA · keyboard | Distinct browser/AT combination, tables and menu semantics | NOT RUN |
| PL-05 | Windows · Edge · forced colours / high contrast | Icon/status meaning, outlines, focus and solid fallbacks | NOT RUN |
| PL-06 | iOS · Safari · VoiceOver · touch | Swipe order, explore-by-touch, control labels, touch targets | NOT RUN |
| PL-07 | iPadOS · Safari · touch + external keyboard | Responsive panels, viewport/reflow and pointer alternatives | NOT RUN |
| PL-08 | Android · Chrome · TalkBack · touch | Swipe order, form editing, dialog feedback, announcements | NOT RUN |

Test reduced motion, transparency, text enlargement, zoom/reflow, colour-contrast and no-hover on configurations that support each feature. Do not infer identical AT behaviour from a virtual machine or browser emulation. Emulation is useful *supplementary* evidence; label it accordingly.

## 6. Representative end-to-end pilot journeys

Use safe test data and deterministic content. If a separate product is not yet integrated into Meridian, implement a **clearly labelled reference harness** and do not claim testing of the production app.

| Journey / case | Exact user objective | High-risk checkpoints | Pass condition |
| --- | --- | --- | --- |
| **J-DOC** — editing/translation | Open sample document, locate specified segment, edit target, inspect term/TM suggestion, save, undo, provoke conflict, choose a safe resolution | Accessible names; edit/read order; shortcut collisions; save status; diff meaning; loss prevention; focus continuity; keyboard-only completion | Correct target value saved and recovered; state announced; no lost work or keyboard trap; equivalent AT path |
| **J-LEARN** — interactive lesson | Find named lesson, play audio, reveal transcript, answer and change one item, submit, inspect feedback, resume at last point | Captions/transcript; question/answer semantics; error and success announcements; focus after feedback; progress not colour-only; no drag-only answer | Answer state and feedback are perceivable/operable by keyboard, touch and selected AT; resume works |
| **J-EVIDENCE** — evidence submission | Create test record, choose a file, select a date/range, resolve invalid data, review, confirm, return to evidence listing | File input and status; date-picker calendar keyboard; required/error descriptions; irreversible confirmation; upload fail/retry; permission disclosure | Valid submission and recovery work without pointer dependence or ambiguous status; review precedes consequential action |

For every journey perform a conventional opaque/no-animation baseline before an expressive version where applicable; hold labels and task content constant. A visual Figma example cannot satisfy a working journey test. Record task **success**, **errors**, **recovery**, **time only when validly measured**, and solo **perceived ease** as separate fields. Self ratings are **not participant findings**.

## 7. Execution protocol (solo evaluator)

1. Choose exact commit/build, task ID, baseline/environment and target platform; state what would count as success before testing.
2. Run applicable axe/Playwright and static checks; link raw run URL and expected scope.
3. Operate entirely with keyboard: headings/landmarks, Tab/Shift+Tab, activation, composite arrows as appropriate, Escape and focus return. Do not confuse visual tab order with actual DOM order.
4. Repeat the consequential task with the real available screen reader; record what is announced verbatim, navigation order and whether it can be completed *without sight*. Use native AT settings, not simulations alone.
5. Check touch and accessible alternate for any gesture, slider, drag, hover or proximity-only state.
6. Test 200% text scaling and relevant 400% zoom/reflow, 320 CSS-pixel responsive layouts where applicable, reduced motion/transparency and actual forced colours/increased contrast. Capture both opaque and glass over simple/complex backgrounds.
7. Inject loading, validation error, network failure, success, undo and conflict. Observe focus, alerts and data preservation.
8. Record concrete results, environment/AT, issue ID, artifacts (redacted), adverse/negative observations and unknowns. For performance, identify hardware and actual end-to-end measurement method; do not report `requestAnimationFrame` scheduling lag as total input latency.
9. Re-run the reproduction after a fix on the originally failing setup **and** a control setup. Close issue only with a linked re-test record; a code merge or green axe scan alone is insufficient.

**Minimum unit of evidence:** one task, one tested commit, one actual configuration, one outcome, one independent observation record per condition. Do not combine untested devices or appearances into a single “pass”.

## 8. Evidence data model and GitHub traceability

Use [observation template](../../research/studies/templates/meridian-accessibility-observation.md), [case inventory](../../research/studies/meridian-accessibility-test-cases.csv), the new **Accessibility Defect** issue template, and the [milestone report template](../../research/studies/templates/meridian-accessibility-release-report.md).

| Field | Required? | Example / rule |
| --- | --- | --- |
| Case ID, component/workflow, Figma node / code route | Yes | `J-DOC`; link actual master/view |
| Git SHA/build, date/time, device/OS/browser/AT/input | Yes | Exact tested configuration; say *unavailable* when not run |
| Environment/appearance, accessibility preferences | Yes | `Aurora / Dusk`, reduced motion enabled |
| Predefined expected behaviour, steps, actual outcome | Yes | Concrete, repeatable and testable |
| Outcome | Yes | `NOT_RUN` / `PASS` / `FAIL` / `BLOCKED` / `NOT_APPLICABLE` |
| Evidence type | Yes | `PLANNED` / `AUTOMATED` / `SOLO_OBSERVED` / `INDEPENDENT` |
| Evidence pointer, technique / WCAG SC, uncertainty | Yes | CI URL, redacted artifact, APG reference; avoid unsupported claim |
| Severity, priority, owner, due milestone, issue, retest | For failures | One issue per root cause; linked regressions |
| Task success / error / time / preference | If measured | Never estimate or convert preference into objective proof |

**Data protection:** only synthetic documents and test records in public GitHub. Store sensitive/raw recordings and informed consent securely outside the public repository. A screenshot may contain personal data or access tokens; review and redact before attaching. As there are currently no recruited participants, no participant consent or user-study data is asserted.

**Severity:**
- **P0 Blocker:** Safety/data loss, inaccessible primary workflow, complete exclusion, unrecoverable trap; stop affected release immediately.
- **P1 Major:** Core task impossible or incorrect with a supported modality, major focus/AT breakdown, misleading consequential action; block beta/stable scope.
- **P2 Moderate:** Meaningful friction, repairable but material access gap; triage to affected release. If it violates any applicable WCAG A/AA criterion, it prevents a *WCAG AA conformance claim* for the scoped product even if the issue is not labelled P1.
- **P3 Minor:** Cosmetic inconsistency or low-impact improvement without missing essential information/function; schedule and document.

No unresolved P0 or P1 is allowed for an affected experimental/beta release. No confirmed unremediated A/AA violation in the stated scope is permitted in a claim that the scope conforms to WCAG 2.2 AA. Release exceptions may allow a clearly labelled *non-conforming experimental preview* only with explicit, time-bounded risk disclosure and an accessible alternative; they do **not** turn a failed SC into a pass.

**Suggested GitHub fields:** `area`, `component-id`, `platform`, `wcag-sc`, `severity`, `evidence-type`, `status`, `owner`, `milestone`, `figma-url`, `retest-evidence`. Use labels as a lightweight fallback where project custom fields are not configured. Link child findings to #12 rather than opening dozens of identical tasks.

## 9. Continuous cadence

| Trigger | Required work | Output |
| --- | --- | --- |
| **Every pull request** | Existing unit/build + axe/browser smoke + semantic/accessibility regressions and token contrast; verify generated file parity; add tests for changed risky mechanics | CI run URL, automated findings, status |
| **Whenever a high-risk component changes** | Keyboard, at least one real applicable AT, focus/error/recovery and an appearance regression on that component | Solo observation + issue/retest if needed |
| **Every active development week / sprint** | Time-boxed risk review of changed families and unresolved P0/P1/P2; sample at least one untested representative configuration when available | Updated coverage dashboard and triage |
| **Each milestone (0.6–1.0)** | Scope inventory + WCAG-EM representative page/process audit, named device/AT matrix, all three working journeys where implemented, all ten automated palette checks, explicit exceptions and limitations | Signed release-readiness report + issue references |
| **Before stable 1.0** | All technical milestone gates **plus independent evaluation** by qualified reviewers and/or consenting users with relevant access needs, as supported by the adopted stable-release policy | Independently grounded findings and final promotion decision |

**Release statuses:** `EXPERIMENTAL`, `BETA-ELIGIBLE`, `BETA-WITH-DISCLOSED-LIMITATIONS`, `BLOCKED`, `STABLE-CANDIDATE`, `STABLE-APPROVED`. A beta technical pass never auto-promotes to stable.

## 10. Release gate checklist

**Gate A — Per PR:** CI green for applicable tests, no P0/P1 regression, documented manual checks for changed high-risk interaction, affected platform information and evidence URLs.

**Gate B — 0.6 experimental/beta:** representative WCAG 2.2 A/AA audit with documented failures/unknowns, three functional journeys or honestly marked prototype blockers, required accessible equivalents, reviewed severity, opaque fallbacks, actual named platform evidence, issue #12 updated, no false conformance claim. Any blocked core journey forbids describing the full scope as beta-ready.

**Gate C — 0.7/0.8/0.9:** progressively broaden high-risk coverage and tested platform/AT matrix; incorporate real consuming product pilots when available, and keep each product's release scope separate.

**Gate D — stable 1.0:** relevant WCAG A/AA criteria evaluated without outstanding violations for the claimed scope, no P0/P1, documented remediations and regression tests, full supported platform claims grounded in tests, actual independent accessibility evaluation and scoped report, explicit ethical/BSDL promotion decision, and maintainer sign-off. **If independent evidence is absent, status remains BETA/RESEARCH PENDING—even with green CI.**

## 11. First execution sprint (tasks, not yet done)

1. **Inventory:** confirm real device/AT availability, baseline commit and three runnable reference journeys; mark blocked cases instead of filling in guessed results.
2. **Automated baseline:** run `npm test`, `npm run build`, `npm run test:browser`; link results and examine which WCAG 2.2 AA checks are not automated.
3. **Core manual pass:** keyboard and real screen-reader tests for dialog/sheet, combobox/date picker, upload/validation, content editing and status announcements.
4. **Environment pass:** Forest Dawn/Dusk plus high-contrast-risk Aurora Dusk, Glacier Dawn, Desert Dawn, Embers Dusk; all ten palette modes covered in token automation.
5. **Three journeys:** run J-DOC, J-LEARN, J-EVIDENCE with synthetic data on any genuinely runnable reference/product demo; write actual observed results.
6. **Triage and report:** open GitHub issues, record regressions/limitations, complete first milestone report, propose per-experiment `REJECT` / `REVISE` / `LAB ONLY` / `PROMOTION CANDIDATE` decision with BSDL review.

The research protocol and issue #12 remain valid; this programme adds an operational *solo-first* evaluation layer without relabelling unperformed independent participant studies as completed.

## References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG-EM evaluation methodology](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [W3C: automated tools cannot check everything](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
- [Meridian existing research protocol](../../research/studies/living-matter-formative-protocol.md)
