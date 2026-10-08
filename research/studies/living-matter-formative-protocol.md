# Meridian 0.6 — Living Matter formative evaluation protocol

**Status:** Prepared, not executed · **Programme:** LM-01 through LM-07 · **Owner:** Meridian Design/Research  
**Ethical basis:** [BSDL constitutional framework](https://github.com/pedrobritx/bsdl/blob/main/bsdl/constitution/principles.md)  
**Research tracking:** [Issue #12](https://github.com/pedrobritx/meridian/issues/12)  
**No participant data or observations have been collected in this document.**

## Purpose and limits

Explore whether interaction and environmental treatments change discoverability, clarity, error rate, perceived control, orientation or preference **in specified tasks**, compared with conventional alternatives. A formative study can reveal usability issues and generate hypotheses. It cannot prove universal benefits, clinical or neurological outcomes, therapeutic benefits, circadian effects or culture-independent intuitiveness.

The prototypes are separately versioned and labelled experimental. No promotion to stable Meridian Core follows automatically.

## Study preparation

1. Verify each prototype runs on a named browser/OS/device and that the underlying tasks succeed with all effects disabled.
2. Prepare comparison tasks, equivalent content, a safe stopping point and a non-animated alternative.
3. Recruit diverse experience and input needs where feasible. Define the scope of any conclusion from the actual recruited sample. A small convenience sample is **exploratory only**.
4. Get explicit informed consent before recording any observation. Participation and recordings are optional; withdrawals must not affect access to the product.
5. Do not request diagnoses, other unnecessary sensitive data or detailed identity profiles. Avoid storing participant names, emails or screen recordings in the public repository.
6. Record a local anonymous study code, tested condition, task order, input method, device/browser and accessibility preference **only when necessary and consented**.

## Standard session (illustrative 25–35 minutes)

| Segment | Planned duration | Instructions |
| --- | --- | --- |
| Orientation and consent | 3–5 min | Explain that effects are unproven and the participant can stop. |
| Baseline tasks | 5–6 min | Familiarise the participant with conventional operation. |
| Controls LM-01–03 | 6–8 min | Compare button activation, segmentation and feedback. |
| Workspace LM-04–06 | 6–8 min | Open/dismiss panel, restore focus, navigate tabs, resize with keyboard and pointer/touch. |
| Environments LM-07 | 5–6 min | Perform identical selection and confirmation under two contrasting environments. |
| Closing interview | 3–5 min | Ask what helped, distracted or was difficult; avoid leading questions. |

Actual tasks, order and time should be adjusted to the participant and recorded, not silently normalised.

## Tasks and hypotheses

| ID | Task | Comparison | Measures | Stop/reject conditions |
| --- | --- | --- | --- | --- |
| LM-01 | Find/activate a known action | Conventional button vs magnetic visual attraction | Completion, erroneous clicks, reported clarity | Moving hitbox or increased misses |
| LM-02 | Choose an option then change it | Native discrete selection vs travelling visual selection | Selection errors, time, semantic comprehension | Unclear selected state or keyboard breakage |
| LM-03 | Repeatedly activate an action | Immediate static feedback vs elastic contact | Action latency, errors, perceived immediacy, comfort | Waiting for animation or distress |
| LM-04 | Open/close inspector and return to launcher | Static spatial transition vs expressive transition | Focus return, navigation errors, orientation | Focus loss or confusion |
| LM-05 | Resize from 60% to a named value | Native range without vs with viscous morph | Accuracy, time, predictability | Text deformation, inaccessible manipulation |
| LM-06 | Read panel content over complex background | Opaque vs glass | Reading accuracy, focus, preference | Any loss of essential legibility |
| LM-07 | Choose/confirm identical destination in contrasting environment treatments | Conventional branding vs environmental palette, appearance held constant | Task equivalence, mis-selection, preference and familiarity separately | Semantic inconsistency, low contrast, branding overridden without permission |

For each task, record exact instructions, start/stop markers, outcome, errors, interruptions and any contradictory observations. Do not infer preference from task performance or vice versa.

## Presentation and analysis

- Alternate or counterbalance condition order as feasible; record order.
- Keep labels, controls, content and task difficulty consistent across variants.
- Include an effects-disabled condition and accessibility accommodations.
- Distinguish **task success**, **time/error measures**, **subjective preference**, **perceived familiarity**, and **discomfort**.
- If recording scores, declare scales and interpretation before collecting them.
- Report individual variation and negative cases; do not hide failures.
- Avoid significance tests or superiority claims without an adequate inferential design and pre-specified power/sample plan.
- Publish aggregate/anonymised findings with method and limitations only.

## Browser, device and accessibility audit

Record at minimum:

- Browser/OS/device, viewport size, input modality and (if appropriate) assistive technology.
- Keyboard focus sequence, focus restoration, voice/screen-reader task completion and text scaling.
- `prefers-reduced-motion`, forced colours, increased contrast, reduced transparency and unsupported blur fallback.
- Opaque foreground and composited glass contrast across simple and visually complex backgrounds.
- Target/gesture equivalence including pointer and touch.
- Runtime measurements with named hardware, test conditions, sample definition and observed frame/input data. **Do not equate requestAnimationFrame scheduling delay with total user-perceived input latency.**
- Energy or battery impact only if directly measured on an appropriate device.

Automated axe, Playwright and token-pair checks are useful evidence but cannot substitute for manual assistive technology and meaningful human-task evaluation.

## Data handling and consent template

**Suggested brief:** “This is a prototype evaluation. We are comparing alternative interface designs, not assessing your personal ability. You may skip any task or stop at any point. We will record only the interaction outcomes and comments you agree to share. Any published results will be de-identified. Do you consent to this session and these specified records?”

Keep consent records outside the public repository and follow applicable privacy law. Do not publish raw participant files, exact health information or recordings.

## Findings template

Use one record per study round:

- Date, study ID, prototype revision and tested task conditions.
- Consent and minimal data method.
- Actual number and relevant characteristics of participants without identifying them.
- Test instructions and alternation order.
- Devices/browsers and assistive settings.
- Completed tasks and errors, summary statistics if suitable.
- Positive and negative qualitative observations, verbatim quotes only with appropriate consent.
- Accessibility and performance observations.
- Biases, missing participants and generalisability limitations.
- Evidence stage: Speculative / Exploratory / Evidence-supported / Validated for scope.
- Disposition per experiment: reject / revise / retain Lab / candidate for stable Design.
- Reviewer, BSDL review result, linked PR/ADR and follow-up issues.

## Current evidence snapshot

- **LM-01–03:** Browser implementation merged; automated unit/browser evidence available, no direct user study.
- **LM-04–06:** Browser implementation merged; automated unit/browser evidence available, no direct user study.
- **LM-07:** Prototype under implementation review; static opaque palette ratios are tested automatically; no direct user study.
- **All:** Manual multi-browser/assistive-tech and real-world composited-background evaluations are pending unless future results are separately linked.

**No stable promotion decision is authorised by this protocol.**
