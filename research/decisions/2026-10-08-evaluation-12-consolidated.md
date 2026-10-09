# Meridian 0.6 — Living Matter
## Evaluation #12: Consolidated preferences, inferred specification, evidence and validation plan

**Prepared:** 2026-10-08  
**Project:** [Meridian](https://github.com/pedrobritx/meridian)  
**Tracking:** [Research and accessibility evaluation #12](https://github.com/pedrobritx/meridian/issues/12) · [Release tracker #13](https://github.com/pedrobritx/meridian/issues/13)  
**Scope:** Consolidation of the user's interview decisions Q1–Q162, followed by five explicitly confirmed high-level decisions. No Meridian implementation, repository change, design-token change, Figma change or release promotion is authorised by this document.  
**Status:** **Preference-gathering phase complete; evidence-based evaluation remains open.**

> **Interpretation key:** **O** = observation reported by the user or informally relayed, not a controlled study result; **P** = explicitly selected design preference; **I** = inferred provisional specification from repeated preferences; **T** = repository-verified technical evidence, not participant validation; **V** = empirical validation required; **R** = superseded or reconciled rule. Statements tagged **P/I** describe intended behaviour, not what has been implemented or measured.

## 1. Decision record: the five substantial decisions

| Decision | Confirmed direction | Consequence |
| --- | --- | --- |
| Notification-state consistency | **P** Accessibility-consistent model | Genuine encounters, explicit unread intent and verified cross-device acknowledgements outrank automatic background/DOM-focus bookkeeping. Q156–Q162's conflicting rules are historical preferences, **superseded for the consolidated specification** (see §6). |
| Release scope | **P** Forest-first reference | First Living Environment candidate is Forest with coherent Dawn/Dusk, representative controls/workspace and shared primitives. Other environment families remain experimental; Forest is not automatically promoted. |
| Accessibility | **P** Demonstrated validation before stable release | Automated CI is necessary but not sufficient; human tasks and named-device/manual AT checks are gates. |
| Configurability | **P** Strong defaults, constrained overrides | Accessible invariant contracts are not optional. Applications can supply business semantics/data and controlled appearance choices, not remove focus, keyboard alternatives or readability. |
| Evaluation closure | **P** Evidence-backed closure | Preference interview may end, but GitHub #12 stays open until recorded human evidence, technical evaluations, BSDL review and explicit experiment-by-experiment dispositions. |

## 2. Evidence ledger: what is known and what is not

### 2.1 Reported observations — limited evidentiary strength (**O**)

Prior informal feedback described **Core Dusk as too dark**, **low-contrast labels on some buttons/lists**, **buttons/status placed too close to edges**, **square focus outlines around rounded controls**, and **surfaces sometimes looking overly flat**. Positive informal comments mentioned **colours, animation and icon hover effects**. These reports are relevant to the next test design and must not be discarded.

**Limits:** Participant counts, consent/recruitment method, tasks, devices, precise wording, observations per condition and measured outcomes have not been established in the supplied interview record. These reports are **not** evidence of measured WCAG failure, broad user preference, task success or therapeutic benefit. Reduced-motion testing was explicitly not confirmed. Keep informal user observation separate from consented participant-study findings.

### 2.2 Repository evidence — verified technical status (**T**)

As documented in [the 2026-10-08 technical evidence audit](https://github.com/pedrobritx/meridian/blob/main/research/findings/2026-10-08-living-matter-technical-evidence.md):

- LM-01–LM-07 have Lab implementations, comparison structures, native-control alternatives and recorded automated testing/CI evidence. Relevant merged work: PRs #16, #18, #19, #20 and research evidence PR #21.
- Automated checks cover aspects of native tasks, keyboard interaction, motion preferences, viewport configurations, semantics and automated accessibility checks; **they do not demonstrate full WCAG conformance or human usability**.
- The documented green post-merge CI run is [#37809992919](https://github.com/pedrobritx/meridian/actions/runs/37809992919). Treat this as evidence for that run, not proof of current unexamined configurations.
- The formative study protocol and observation worksheet exist but do not contain completed, consent-based study findings.
- Issue #12 is **open**. Participant comparisons, real screen-reader/device testing, composited-glass contrast, representative input/frame measurements and independent BSDL decisions remain pending.

**Evidence hierarchy:** CI/implementation evidence supports technical readiness to study; reported anecdotes generate hypotheses; interview preferences establish desired behaviour; **only appropriate test records support participant-outcome claims**.

## 3. Proposed product boundaries and design priorities

### 3.1 Architectural boundary (**P**, Q101–104; **I** details)

**Meridian owns** token semantics, component contracts, accessible presentation, visual/transient state, focus/feedback patterns, reference compositions and guidance. **Adopting applications own** authoritative notifications, permission/authentication, tasks, event creation/classification, read-state persistence, synchronisation, integration revocation, data retention and action success/failure. A component must not invent success or mutate authoritative business state simply to produce an animation.

**I:** Contracts should expose explicit states and events plus documented neutral, stale/unverified and unavailable presentations. Unknown states do not imply successful resolution. Use neutral presentation where necessary and a clear stale qualifier when the last confirmed state is shown. Confirmed authoritative changes replace stale/neutral visuals immediately; auditory announcements follow app-selected notification policy.

### 3.2 Forest-first visual/environment model (**P**, Q1–71, Q52–57; **I** details)

- **P:** Forest Living Environment is the first cohesive reference. Prioritise recognisable botanical, timber, paper, soil/stone and filtered-light qualities; tactile depth/elevation and contextual natural surfaces over arbitrary glass or flat decoration.
- **P:** Forest Dawn/Dusk should resemble an organic lighting change, not a blackened interface. Dusk must remain readable; ambient time-of-day transition may use privacy-preserving local sunrise/sunset approximation/manual locale and explicit overrides.
- **P:** Separate user appearance, brightness, atmosphere and motion controls; respect accessibility precedence, explicit user choice and local context.
- **P:** User-selected Living Environment drives most visual appearance; product name/logo/recognisable symbolic identity remains; semantic warning/success meaning must retain distinguishable semantics, labels and icons.
- **I:** Define layers for **accessibility constraint → explicit local/user override → chosen environment → limited product identity → component defaults**, resolving conflicts in favour of functional accessibility. Record the effective override source to make resets and inheritance understandable. This elaborates, rather than changes, Q56–57's environment/brand decision.
- **I:** Ship opaque/solid alternatives for decorative translucency, preserve text and focus contrast over actual backgrounds, and provide equivalent meaning without visual material effects.

### 3.3 Controls, motion and workspace (**P** and **I**, Q1–71)

- **P:** Tactile press model: raised rest state, restrained responsive hover/contact, inset press feedback; action execution must not wait for the animation. Focus treatment follows rounded geometry, not a square outline on rounded controls. Magnetic effects remain **cosmetic**, not moving hit targets.
- **P:** Organic icons and relationship cues are permitted where semantic controls remain recognisable; native keyboard/touch selection and semantics do not depend on motion.
- **P:** Shared, interruptible physics and spatial continuity where beneficial; reduced motion supplies a quiet, immediate functional alternative.
- **P:** Contextual controls near affected content; subtle persistent discovery cues, progressive disclosure and reversible scoped overrides.
- **P:** Consequence-based alerts, graduated destructive safeguards, layered undo/recovery and semantic focus fallback.
- **P:** Defer routine automatic workspace rearrangements during active interaction; preserve spatial continuity and focus. Distinct exception: expanded actionable-status lists update as actions resolve (Q116–118).
- **I:** Define motion as optional decorative feedback layered over the same native task and status semantics. Where speed, contrast, discomfort or task error competes with animation, reliable action and readability win. Do not choose undocumented spring/velocity numbers as settled requirements.

### 3.4 Preference storage and sharing (**P**, Q52–57, Q88–100)

- **P:** Local-first preferences with optional authorised, compatible cross-device/cross-product sharing; preserve platform accessibility settings and allow user overrides.
- **P:** Privacy-conscious notification previews; minimal retained history, explicit deletion and deletion-first reconciliation; revocation invalidates the appropriate shared cache without resurrecting private records from offline devices.
- **I:** Contracts distinguish locally scoped presentation choices from app-authoritative settings and include safe defaults when sync is disconnected. Meridian may supply example adapters/patterns but must not become a synchronisation service. Show deletion uncertainty truthfully; avoid claiming offline cleanup has finished until confirmed by the owning application.

## 4. Workspace status and notification contract (**P**, Q72–142)

1. **Attention model.** User-interrupting alerts are reserved for conditions genuinely requiring decisions, conflict handling or recovery; routine events are quiet (**P**, Q72). This is separate from whether an item contributes to unread count (**P**, Q142).
2. **Status overview.** A compact workspace status summarises actionable issues; selecting it reveals an accessible list without stealing focus. Items update and focus falls back next → previous → summary when removed. When none remain, show compact persistent **All clear**, even if historical unread announcements exist (**P**, Q111–121; **I** clarified distinction).
3. **Unavailable actions.** Show stale/unverified status when confirmation fails; block only operations requiring current verification, not unrelated tasks. Provide concise group explanation and action-specific contextual reasons, accessible without focusing disabled controls. Restore control availability promptly; announce stable availability in 500 ms batches, related actions grouped by name/count with incremental wording (**P**, Q122–135).
4. **Announcements.** App assigns `silent`/`polite`/`assertive`; Meridian defines accessible patterns. Preserve event order and historical event wording while current authoritative status remains independently discoverable (**P**, Q106–110). Source-free group/count announcements may occur across active/background workspaces (**P**, Q136–138); event source, type and time must be discoverable in history (**P**, Q139). Source-free ambiguity remains a **V** risk.
5. **Centre organisation.** Actionable notifications first, in newest-first order with source/time/action; discoverable secondary announcement-history area in the **same** notification centre; do not add a new persistent history launcher (**P**, Q74–76, Q139–141).
6. **Indicators.** Maintain separate **unread** and **pending-action** indicators. Unread includes new, unencountered historical announcements; pending counts only outstanding actionable issues. A read notification can still have a pending action; unread history alone does not contradict **All clear** (**P**, Q75–76, Q120, Q142; **I** consequences).
7. **Read synchronisation.** Applications own cross-device revisions and reconciliation, respect explicit unread intent and verified encounters, handle offline deletion/revocation without resurrecting inaccessible items (**P**, Q84–100; consolidated decision #1).

## 5. Announcement-history encounters: proposed fine-grained contract (**P**, Q143–155; **I** completion)

| Area | Consolidated specification | Origin and status |
| --- | --- | --- |
| Individual entries | Opening the centre/history does **not** mark all entries read; only encountered entries qualify. | **P** Q143 |
| Visual encounters | Essential event information (description, source, time) must be meaningfully visible; entries taller than viewport must remain eligible. | **P** Q144, Q146 |
| Minimum visual exposure | **1 second** total meaningful exposure. | **P**, provisional numeric parameter Q147; **V** |
| Brief interruption | Pause/resume for loss of meaningful visibility of at most **500 ms**, provided reading context remains stable. | **P** Q148–149; **V** |
| Reset triggers | Rapid scrolling, substantial viewport-relative displacement, visibility loss beyond tolerance. | **P** Q148–151; actual velocity/displacement cutoffs are **I/V**, not invented here |
| Device differences | Normalise movement and account for touch, wheel, trackpad and keyboard. | **P** Q151; **V** calibration |
| Programmatic scrolling | Ignore transit entries; count destination after essential-content and position stability; preserve exposure only for minor adjustments in same reading context. | **P** Q152–153 |
| Content changes during exposure | Restart on material change to essential fields; cosmetic/minor layout changes preserve exposure and context. Applications declare material changes; component contract supplies conservative fallback. | **P** Q154–155 |
| Assistive-technology navigation | An accessible navigation encounter is an independent route to acknowledgement; do **not** infer completed speech from DOM focus alone. | **P** Q144 plus accessibility-consistent consolidated decision; **V** |
| Explicit mark-unread | User's deliberate unread state is protected until explicit acknowledgement or confirmed task resolution (Q85–87). Mere visibility, focus or incidental re-encounter cannot clear it. No background-focus auto-clear. | **R/I** consolidated decision #1 superseding Q158–160; reconcile with Q85–87 |
| Read-state events | Apps provide stable event/revision identifiers, acknowledged revision, user-intent provenance and authoritative sync results; no Meridian backend. | **I**, required to implement reliably; not an API proposal or implemented feature |

**Important:** The 1-second and 500-ms parameters are **user-selected proposals**, not proven reading thresholds or WCAG requirements. Native/AT behaviour must be validated independently. Continuous presentation does not prove that a person cognitively read an announcement; the rule is an operational proxy.

## 6. Contradictions, revisions and unresolved risks

| Conflict | Earlier preferences | Resolution or status |
| --- | --- | --- |
| Focus counted as reading even off-screen/in background | Q157–160 permitted immediate re-acknowledgement on retained DOM focus, overriding explicit unread intent. | **R:** Superseded by the user's final consolidated choice: genuine encounter and explicit unread intent are primary. Background/hidden DOM focus alone must not acknowledge updated content. |
| Global unread restoration overriding verified acknowledgements | Q161–162 restored unread on return even if another device genuinely read the latest revision. | **R:** Superseded by accessibility-consistent cross-device model. Preserve verified current-revision acknowledgement; no return-triggered global unread rollback. |
| Every minor update reopens read entries vs only material content restarts exposure | Q156 reopened on any content/metadata change; Q154–155 restarted exposure only for material essential changes. | **I/R:** Treat a *new substantive event revision* as eligible for renewed unread status; do not reopen a read entry solely for cosmetic rendering or timestamp reformatting. If metadata is authoritative and semantically significant, apps can declare a new revision. Requires explicit evidence-based review; this narrows the earlier Q156 preference under decision #1. |
| All-clear vs unread history | Q120 compact All clear; Q142 history contributes to unread. | **I:** All clear means **no pending actionable issue**, not **zero unread**. Display both statuses clearly without conflation. |
| Routine announcements quiet vs unread count | Q72 says routine events do not draw attention; Q142 says unread history counts. | **I:** Quietly update count without interruptive toast/live announcement solely for badge increase. |
| Source-free background spoken notices vs contextual clarity | Q136–138 prohibit source in short spoken group/count announcements from all workspaces; Q139 adds history with source/time. | **V:** Preserve preference as a hypothesis, but assess disorientation, ambiguity and AT verbosity. If unsafe, revise after testing rather than silently assert this solved. |
| Queue every historical status announcement vs stale authoritative truth | Q108–110 sequentially deliver even superseded events and distinguish history from current status. | **I/V:** Use past-tense/event-labelled announcements and a separate current-state region. Test queue overload and potentially conflicting guidance; do not claim this is validated. |
| Universal threshold vs cross-device accessibility | Q131's 500-ms availability-announcement stability and Q149's 500-ms visual interruption tolerance have different purposes. | **I:** Keep separate named timing tokens with separate reset semantics; do not conflate them because their numbers happen to match. |
| User Living Environment vs product branding/semantic colours | Q52–57 user environment priority, product identity retained, semantic meaning preserved. | **I:** Accessibility/semantics constrain both; appearance honours user environment; brand reduced to identity marks. |

**Rule of interpretation:** The user's five later consolidated decisions take precedence where they intentionally resolve contradictory interview choices. Previous preferences remain recorded for traceability, not silently erased. No test outcome is inferred from this reconciliation.

## 7. Forest-first reference: release boundary and experiment status

The first coherent *candidate* specification should cover Forest Dawn/Dusk across a small, complete vertical slice: typography and semantic colours, focus states, button and segmented selection, representative status/notification presentation, workspace panel/resizing, decorative motion/reduced-motion equivalence and opaque/glass fallbacks. This is **I**—recommended scope, not authorised implementation.

| Experiment | Lab focus documented in repository | Consolidated position |
| --- | --- | --- |
| LM-01 | Cosmetic magnetic button affordance, unchanged native hit target | **Lab only**; evaluate activation accuracy/discoverability |
| LM-02 | Native radio selection with decorative liquid fusion/separation | **Lab only**; evaluate semantic clarity and discrete selection |
| LM-03 | Elastic contact independent of action execution | **Lab only**; evaluate errors, speed, discomfort |
| LM-04 | Native target selection with decorative bounded spatial attraction | **Lab only**; evaluate focus return/orientation |
| LM-05 | Accessible native range with viscous visual resize | **Lab only**; evaluate accuracy, keyboard parity and deformation |
| LM-06 | Glass versus opaque material layer | **Lab only**; test contrast with actual composited complex backgrounds |
| LM-07 / H07 | Multiple optional environment families; independent Dawn/Dusk and brand accent | **Lab only**; prioritise **Forest** reference, do not claim universal familiarity |

**No experiment is approved for stable Core/Design promotion merely because it is a Forest-first priority or passes CI.** Meridian 0.5 production contracts are not altered by this record.

## 8. Required empirical validation (**V**)

Use the existing [formative protocol](https://github.com/pedrobritx/meridian/blob/main/research/studies/living-matter-formative-protocol.md), [hypothesis registry](https://github.com/pedrobritx/meridian/blob/main/research/hypotheses/living-matter.md) and [observation worksheet](https://github.com/pedrobritx/meridian/blob/main/research/studies/templates/living-matter-observation.md). Assign study IDs, consent, task definitions and configurations; publish only de-identified findings.

### 8.1 Participant tasks and measures

Use conventional/effects-disabled comparisons and counterbalanced order when practical. Per LM-01–LM-07, record **task completed, errors/recovery, duration if valid, perceived ease, preference, discomfort and negative cases separately**. Do not equate visual delight with improved performance or make universal/circadian/therapeutic claims. Include participants with relevant input needs; describe recruitment bias and narrow sample limitations.

### 8.2 Manual accessibility matrix

- **Keyboard:** native task completion, Tab order, focus visibility/shape, focus restoration after dismiss/removal, non-drag alternative, unavailable-action explanation.
- **Assistive technology:** meaningful event semantics, screen-reader navigation encounter vs mere focus, live-region queue, event source identification, actionable vs historical structure, deliberate unread protection; record named OS/browser/AT combinations (e.g. Safari/VoiceOver, Firefox/NVDA, mobile VoiceOver/TalkBack as supported).
- **Visual:** actual contrast for Forest Dawn/Dusk, corrected Core Dusk, semantic states, text scaling/zoom, high/forced contrast, complex/composited glass, fallback to opaque, focus over textured surfaces.
- **Motion/inputs:** reduced motion and reduced transparency, mouse/trackpad/touch/keyboard parity, interruption/timing effects, scroll snapping/programmatic navigation, larger/taller history entries, touch targets and rapid scrolling.
- **Read-state scenarios:** genuinely encountered vs merely rendered; backtab/inactive background focus; minor/major content updates; intentional Mark unread; same-event cross-device read; offline/stale sync; revocation and deletion; history badge vs pending actions; all-clear with unread history.
- **Performance:** representative named-device end-to-end input responsiveness, frame consistency, device load, and if relevant energy use; do not report requestAnimationFrame scheduler delay as measured interaction latency.

**Recording rule:** Each result has task, condition, device/browser/AT, expected behaviour, observed behaviour, measured result where applicable, artifact reference and limitations; mark untested as **Not tested**, never **Pass**.

### 8.3 Recommended acceptance/rejection gates (proposals, not yet measured)

1. **Accessibility gate:** critical task completion via keyboard and intended assistive technology; no unresolved severe semantic, focus or readability failure within target support matrix. Failures force **revise/reject/retain Lab**.
2. **Behaviour parity gate:** essential tasks work with motion and translucency disabled, with identical authoritative outcomes.
3. **Clarity gate:** user/task evidence must not show unacceptable loss of recognisability, accuracy or understanding relative to control.
4. **Performance gate:** representative measurements document frame and input responsiveness under declared conditions; unacceptable regressions block promotion.
5. **Ethics/BSDL gate:** independent review of autonomy, accessibility, transparency, privacy, preference dominance and non-deceptive status; documented reject/revise/Lab-only/candidate decision per experiment.
6. **Documentation gate:** negative cases, confounders, limited generalisability, data protection and reviewer decision are recorded. Green CI and this interview alone cannot satisfy closure.

## 9. Practical next steps — without implementing Meridian

| Priority | Action | Evidence / deliverable | Status |
| --- | --- | --- | --- |
| 1 | Archive this specification as **interview decision record**, not study findings; retain traceability and explicit superseded Q156–162 rules. | Versioned decision/provenance record | **Document prepared locally; not uploaded to repository** |
| 2 | Translate Q1–Q162 into a concise requirement–hypothesis–test crosswalk, including Forest scope and notification-state conflict scenarios. | Matrix: requirement ID, Q references, observed/proposed/inferred, validation task | Pending |
| 3 | Define Forest Dawn/Dusk comparison variants and exact supported tasks/devices; ensure equivalent static/accessible controls. | Frozen test setup and condition list | Pending |
| 4 | Recruit/consent a suitably described formative sample; log anonymous task outcomes using the existing worksheet. | Participant observations, including failures and limitations | Pending |
| 5 | Complete manual keyboard, screen-reader, contrast/glass, reduced-motion, scrolling and notification-state walkthroughs. | Reproducible device/browser/AT matrix | Pending |
| 6 | Measure real end-to-end responsiveness and frame consistency on specified hardware; review any animation cost. | Named-hardware technical report | Pending |
| 7 | Conduct separate BSDL/accessibility/ethics review for LM-01–LM-07 and Forest-first readiness. | Signed/reviewed disposition per experiment | Pending |
| 8 | Resolve findings, record no-auto-promotion decision, and **only then** assess whether #12 can close and which (if any) components become stable-release candidates. | Evidence-backed issue closure decision and release recommendation | Pending |

### End state / disposition

- **Interview preference collection:** complete through Q162 plus five consolidated decisions; no need for a continued one-choice-per-message questionnaire.
- **Specification:** sufficiently directional for research planning; granular details inferred where reasonable and explicitly provisional.
- **Participant evaluation:** **not complete**; reported anecdotes are not controlled participant findings.
- **LM-01–LM-07:** **retain in Lab** pending study and independent review.
- **Meridian 0.6 stable release:** **not approved**; Forest-first is a priority candidate, not a release decision.
- **GitHub #12:** **keep open** until its acceptance gates are met with evidence.
- **Repository/design artifacts:** unchanged. This Markdown file is a standalone evaluation draft outside the Meridian repository.

## Reference links

- [Meridian evaluation issue #12](https://github.com/pedrobritx/meridian/issues/12)
- [Technical evidence audit (2026-10-08)](https://github.com/pedrobritx/meridian/blob/main/research/findings/2026-10-08-living-matter-technical-evidence.md)
- [Living Matter formative protocol](https://github.com/pedrobritx/meridian/blob/main/research/studies/living-matter-formative-protocol.md)
- [Living Matter hypothesis registry](https://github.com/pedrobritx/meridian/blob/main/research/hypotheses/living-matter.md)
- [Participant observation worksheet](https://github.com/pedrobritx/meridian/blob/main/research/studies/templates/living-matter-observation.md)
- [ADR-0001: prototype-first](https://github.com/pedrobritx/meridian/blob/main/docs/adr/0001-meridian-next-prototype-first.md)
- [BSDL constitutional framework](https://github.com/pedrobritx/bsdl/blob/main/bsdl/constitution/principles.md)