# ADR-0001 — Meridian Next: prototype-first humanistic design system

- **Status:** Accepted in principle by project owner, 2026-10-08; implementation pending review.
- **Decision scope:** Meridian repository; no amendment to BSDL constitution.
- **Baseline:** Meridian 0.5.0, `main` at `64fa860dcca68d5a49854e9a79a25c339e45babe`.
- **Authority:** User's 15-question design interview and explicit approval to begin Phase 0 and plan 0.6.
- **Governance:** [BSDL constitutional principles](https://github.com/pedrobritx/bsdl/blob/main/bsdl/constitution/principles.md).
- **Related plan:** [Meridian 0.6 — Living Matter](../roadmap/0.6-living-matter.md).

## Context

Meridian 0.5 provides a neutral Core, six design profiles (Core, Grass, Paper, Parallel, Canvas, Gallery), twelve profile/appearance combinations, documented semantics and accessibility, a Vite reference, a Figma library and token publication/review infrastructure. Its next evolution is intended to explore naturally familiar, expressive material and motion interactions without destabilising the existing system.

## Decisions from the interview

| Question | Selected direction | Implementation interpretation |
| --- | --- | --- |
| Q1 | D — integrated system | Combine theory, distinct visual/interaction language and reusable implementation. |
| Q2 | B — context determines trade-offs | High-stakes and repetitive tasks prioritise efficiency; expressive contexts allow play. |
| Q3 | C — shared visual grammar | Use coherent principles, not a mandatory fixed aesthetic. |
| Q4 | C — contextual materiality | Paper, stone, glass, liquid etc. have task-relevant roles. |
| Q5 | B — expressive liquid physics | Explore attraction, merging, separation, deformation and rebound. |
| Q6 | C — adaptive accessibility | Respect OS settings, device constraints and input differences without altering essential meaning. |
| Q7 | B — natural colour ecosystem | Explore forest, ocean, desert, alpine, storm and celestial families, each potentially light/dark. |
| Q8 | C — experimental design laboratory | Hypotheses and interactive prototypes precede promotion to stable components. |
| Q9 | D — integrated human familiarity | Examine embodied, cultural and learned-digital familiarity. |
| Q10 | E — constitutional governance + experimental freedom | BSDL boundaries apply to Lab and Design; stable adoption needs evidence and review. |
| Q11 | D — progressive cross-platform | Portable semantics; TypeScript/React reference first; SwiftUI later. |
| Q12 | E — extensible ecosystem | Provide extension contracts and compatibility/accessibility gates. |
| Q13 | E — Design + Lab + Research + Community | Connected knowledge domains, not separate copies of Core. |
| Q14 | B — product identity takes precedence | Never overwrite application branding or content semantics. |
| Q15 | B — visual/interaction prototype first | Prioritise Living Matter experiments before broad technical standardisation. |

## Architectural constraints

1. **Core is behavioural, semantic and accessible.** Materials, palettes and motion are composable, contextual expressions.
2. **Product brand and content remain product-owned.** Existing Meridian profiles are optional examples, not required skins.
3. **Lab is explicitly experimental.** Speculative and exploratory work cannot be presented as validated HCI claims or silently exported into stable tokens.
4. **Input parity and safety are non-negotiable.** Meaning, hitboxes, keyboard focus, native control semantics and non-drag equivalents must survive effects and fallbacks.
5. **Environment and appearance are independent concepts.** Avoid multiplying Figma modes for every theoretical combination; use versioned manifests and tested presets.
6. **BSDL governs ethics and evidence; Meridian specifies interface practice.** Amendments to BSDL are outside this milestone and require BSDL's own ADR process.
7. **Release by reviewed changes.** Preserve current Figma IDs/aliases and Figma→GitHub draft-PR conflict protections.
8. **Progressive rendering.** Prefer CSS/transforms and native UI; require evidence before WebGL/WebGPU or heavy custom physics enters production.

## Explicit tensions and resolution

- Expressiveness vs efficiency: choose task-dependent intensity, test against non-animated controls.
- Familiarity vs novelty: distinguish affordance recognition from aesthetic preference.
- Environmental richness vs theme complexity: publish optional environments; prohibit Cartesian-product mode proliferation.
- Experimental freedom vs evidence: allow research exploration, gate stable promotion.
- Brand autonomy vs system coherence: share interaction contracts, not exact appearance.
- Motion vs accessibility: reduced-motion, increased-contrast, reduced-transparency and input alternatives are essential.
- Cross-platform consistency vs platform convention: preserve semantics, not pixel identity.

## Scope

**Now (Phase 0):** baseline/CI inspection, approved decision record, experiment charter, 0.6 delivery plan, issue backlog and review PR.

**0.6 candidate:** Living Controls, Living Workspace, Living Environments; six focused motion/material experiments; exploratory evaluation and records.

**Not in 0.6:** product migrations, general-purpose rendering engine, stable React package, SwiftUI, community portal, normative claims of neurological or circadian health benefit, BSDL changes.

## Consequences

- Benefits: reversible exploration, explicit traceability, no compulsory visual rebrand, ability to test real interactions.
- Costs: research and evaluation effort; intentional dual track between Lab and stable Design; repeated fallback testing.
- Rejected options: full redesign of 0.5; mandatory liquid-glass skin; publication of all experiments as stable components; immediate multi-platform rendering engine.
- Review trigger: evidence that current architecture prevents prototype work, new research contradicting assumptions, significant accessibility regressions, or changes in BSDL governance.

**Promotion rule:** lab candidate → scoped evaluation → design/engineering/ethical review → approved contract → implementation → validation → versioned release. A prototype is never equivalent to a production component.
