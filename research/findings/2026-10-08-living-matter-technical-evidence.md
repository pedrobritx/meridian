# Meridian 0.6 — Technical evidence and research readiness

**Snapshot:** 2026-10-08  
**Programme:** Living Matter (LM-01–LM-07)  
**Evidence classification:** Implementation verified in automated CI; **human evaluation and stable-component promotion are pending**.  
**Review issue:** [#12](https://github.com/pedrobritx/meridian/issues/12); release tracker [#13](https://github.com/pedrobritx/meridian/issues/13).

## Reproducible implementation record

| Surface | Experiment | Implemented experience | Technical reference |
| --- | --- | --- | --- |
| Living Controls | LM-01 | Cosmetic magnetic pointer feedback with an unchanged native button hit target | [Living Controls](../../lab/living-controls/) |
| Living Controls | LM-02 | Native radio selection and a decorative two-object fusion/separation effect | [Living Controls](../../lab/living-controls/) |
| Living Controls | LM-03 | Elastic press/rebound independent of immediate action execution | [Living Controls](../../lab/living-controls/) |
| Living Workspace | LM-04 | Native West/Center/East target selection and a decorative bounded damped attractor exhibiting inertia | [Living Workspace](../../lab/living-workspace/) |
| Living Workspace | LM-05 | Visually viscous width change driven by an accessible native range input | [Living Workspace](../../lab/living-workspace/) |
| Living Workspace | LM-06 | Glass material experiment with an opaque alternative | [Living Workspace](../../lab/living-workspace/) |
| Living Environments | LM-07 / H07 | Six optional families, independent Dawn/Dusk, independent product-identity accents and identical native tasks | [Living Environments](../../lab/living-environments/) |

Core design-token contract, Figma source components and consuming product integrations were not deliberately modified by these experimental implementations.

### Evidence available

- [PR #16](https://github.com/pedrobritx/meridian/pull/16): initial Living Controls.
- [PR #18](https://github.com/pedrobritx/meridian/pull/18): initial Living Workspace and earlier CI regression correction.
- [PR #19](https://github.com/pedrobritx/meridian/pull/19): Living Environments.
- [PR #20](https://github.com/pedrobritx/meridian/pull/20): full LM-02 visual fusion and inertial LM-04 attractor.
- [Latest post-merge main CI](https://github.com/pedrobritx/meridian/actions/runs/37809992919): successful validation and deployment workflow after PR #20, including repository tests, build and browser-suite execution.

Automated tests cover native task operation, keyboard input, movement preferences, multiple viewport configurations, semantics and automated WCAG A/AA rules. They do **not** establish full WCAG conformance on their own, human task effectiveness, screen-reader equivalence on real devices, long-term performance/battery impact, or readability over every composited glass scene.

### Figma design studies

- [Living Controls overview](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=182-35)
- [LM-02 visual fusion study](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=202-40)
- [Living Workspace overview](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=190-35)
- [LM-04 attraction study](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=203-34)
- [Living Environments catalogue](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=197-35)

The editable study boards are visual specifications; browser implementations supply actual interaction dynamics. No Figma native variable modes were added for the experimental environment Cartesian product.

## What the evidence does not yet establish

| Research gate | Current outcome | Required next action |
| --- | --- | --- |
| Usability / perception | **Not evaluated with recruited participants** | Consent-based comparison studies for tasks in the [formative protocol](../studies/living-matter-formative-protocol.md) |
| Human familiarity / cultural applicability | **Unknown** | Recruit and document relevant audiences, avoid assuming a universal preference |
| Real assistive technology | **Manual evaluation pending** | Test on named browser + screen-reader + OS configurations with specific tasks |
| Safari/Firefox or other engines | **Incomplete manual coverage** | Repeat documented behaviour on actual supported platforms |
| Composited glass contrast | **Not demonstrated for arbitrary images** | Capture simple/complex scenes; measure effective contrast, adapt or fall back to opaque |
| Runtime end-to-end latency / frame stability | **No representative benchmark report** | Record hardware, platform, task, device load, frame timing and input responsiveness |
| Battery/power | **Unknown** | Only make claims if observed under a documented method |
| BSDL review and promotion | **Not authorised** | Review evidence, accessibility, user autonomy and ethics; explicitly accept/reject/revise each pattern |

The Lab's `requestAnimationFrame` scheduling-delay display is only a local descriptive observation. It cannot be re-labelled as measured input latency or as evidence of better performance.

## Provisional disposition of each experiment

**LM-01, LM-02, LM-03, LM-04, LM-05, LM-06 and LM-07: RETAIN IN LAB — exploratory.**

This is a **scope/status decision**, not a design endorsement or evidence of user benefit. Promotion requires study results and review against [BSDL](https://github.com/pedrobritx/bsdl). No stable design tokens, React production APIs or consuming-product migrations are approved by this document.

## Human-study preparation

Use the [formative evaluation protocol](../studies/living-matter-formative-protocol.md) and [observation template](../studies/templates/living-matter-observation.md). For each comparison, vary one factor at a time where feasible, counterbalance ordering, record task success/time/errors separately from preference or delight, and retain negative observations and limitations. Do not publish raw participant data in the repository.

**Next authorised action:** select representative participants and devices, arrange explicit consent, execute the protocol, and review the actual observations. Until then, #12 and milestone #13 should remain open.
