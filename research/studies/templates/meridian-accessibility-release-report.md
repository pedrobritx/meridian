# Meridian accessibility — Milestone release-readiness report

**TEMPLATE ONLY. This document makes no WCAG conformance or user-study claim.**  
Programme: [0.6 Accessibility & Evaluation Plan](../../../docs/accessibility/meridian-0.6-evaluation-plan.md)  
Cases: [Seeded evaluation matrix](../meridian-accessibility-test-cases.csv)  
Research: [#12](https://github.com/pedrobritx/meridian/issues/12)

## Scope of evaluation

| Field | Value |
| --- | --- |
| Milestone / planned version | |
| Status | DRAFT / BLOCKED / EXPERIMENTAL / BETA-ELIGIBLE / STABLE-CANDIDATE / STABLE-APPROVED |
| Git SHA(s), deployed URL(s) | |
| Figma baseline nodes / source sets | |
| Actual supported browsers/OS/AT stated in release claim | |
| Evaluation dates and evaluator(s) | |
| What is explicitly out of scope | |
| WCAG target and evaluated subset/processes | WCAG 2.2 A/AA target; scope must be specified |
| Independent evidence available? | **NO — pending** until actually obtained |

## Inventory and sampling

- Number of rendered surfaces evaluated:
- Number of components in scope:
- High-risk components and state paths actually observed:
- Complete end-to-end journeys evaluated: J-DOC / J-LEARN / J-EVIDENCE
- Rationale for selected and excluded configurations:
- Ten environments/appearances machine-assessed? Include exact CI link and revision:
- Manual environments actually assessed:
- Platform/AT test matrix: mark NOT_RUN rather than assumed PASS.

## Evidence ledger (do not infer)

| Case / GitHub issue | Planned / Automated / Solo / Independent | Actual tested setup and commit | PASS / FAIL / BLOCKED / NOT_RUN / N/A | Supporting artifact |
| --- | --- | --- | --- | --- |
| | | | NOT_RUN | |

**Results must be based on actual sessions.** Do not add fake case rows to inflate coverage. Count `NOT_APPLICABLE` separately; do not treat blocked tests as passed. Provide denominator for every coverage metric.

## Findings, risk and remedial action

| Severity | Open count | Affected workflow | WCAG A/AA violation? | Next action / owner |
| --- | --- | --- | --- | --- |
| P0 blocker | UNKNOWN | | UNKNOWN | |
| P1 major | UNKNOWN | | UNKNOWN | |
| P2 moderate | UNKNOWN | | UNKNOWN | |
| P3 minor | UNKNOWN | | UNKNOWN | |

- Actual successful keyboard journeys:
- Actual screen-reader journeys:
- Actual mobile/touch journeys:
- Opaque/glass and reduced-motion fallbacks with supporting screenshots/configuration:
- Data-loss/recovery observations:
- Negative cases, regressions and contradictory findings:
- Known accessibility failures and impact on any conformance claim:
- Documented exceptions with rationale, owner, compensating accessible path and expiry:
- Untested devices/AT/assistive needs and generalisability limits:

## Technical reproducibility

- `npm test`: [NOT RUN for this report] — CI URL and commit:
- `npm run build`: [NOT RUN for this report] — CI URL and commit:
- `npm run test:browser`: [NOT RUN for this report] — CI URL and commit:
- Browser/axe ruleset, config and violations:
- Native assistive technology version and observed task logs:
- Actual input/frame performance method (if measured):
- Independent reviewer/participant methods, consent and anonymisation (only if actually performed):

## Promotion criteria

- [ ] Actual scope, supported technologies and complete representative processes defined.
- [ ] All applicable WCAG 2.2 A/AA criteria evaluated with identified failures; no unsupported blanket conformance claim.
- [ ] Zero unresolved P0/P1 for release scope.
- [ ] No outstanding applicable A/AA violation for any claimed conforming scope.
- [ ] All three journeys implemented, executed or accurately designated blocked/out-of-scope.
- [ ] High-risk keyboard and real AT paths tested on the platforms *claimed* to be supported.
- [ ] Reviewed errors, regressions and unresolved exclusions with linked issues.
- [ ] Automated tests/build/browser checks linked to exact commit.
- [ ] Opaque and static alternatives proven for expressive material effects in tested scenarios.
- [ ] **For stable only:** independent consented evaluation evidence and appropriate reviewer sign-off exist.
- [ ] BSDL promotion decision recorded for affected LM experiments.

**Proposed decision:** BLOCKED / EXPERIMENTAL / BETA-WITH-DISCLOSED-LIMITATIONS / BETA-ELIGIBLE / STABLE-CANDIDATE / STABLE-APPROVED

**Decision rationale:**  
**Evidence quality / unknowns:**  
**Reviewer's identity or reviewer code and date:**  
**Release owner approval:**  

> An unperformed test is **NOT RUN**. A passed automated rule is **AUTOMATED**. A maintainer observation is **SOLO_OBSERVED**. A real consented independent evaluation is **INDEPENDENT**. These are distinct labels and cannot be substituted.
