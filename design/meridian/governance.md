# Governance and contribution

## Lifecycle

**Proposed → In review → Ready for implementation → Implemented → Deprecated.** Figma-complete does not imply implemented. Maintain a component owner and an implementation issue/PR link in the handoff. Pedro is the project owner; role assignments below describe responsibilities rather than naming unconfirmed reviewers.

1. **Propose:** open a GitHub issue using the contribution template. Describe the user task, evidence, existing alternatives, scope, screenshots and target Figma nodes. Check whether an existing component or variant already solves it.
2. **Explore:** work in a clearly named proposal section. Follow Meridian tokens and use linked instances. Compare at least one simpler option for complex flows; test the concept with representative users where risk warrants it.
3. **Review design:** the system maintainer checks semantics, hierarchy, both themes, state coverage, token reuse, composition, long content and visual do/don't rules.
4. **Review engineering and accessibility:** an implementer checks native behaviour, component API, responsive feasibility, performance, focus, announcements, reduced motion and recovery. Record evidence, unresolved issues and named approvers.
5. **Approve:** the designated maintainer marks Ready for implementation only when the checklist passes. Save a named Figma version such as `Meridian 0.3 — approved for engineering`; publish library changes through Figma's normal workflow when approved. A named version is a handoff marker, not proof of code approval.
6. **Implement and verify:** token exports and previews enter a draft PR; implementers adapt the product theme deliberately. Run automated checks and manual keyboard/screen-reader/responsive checks. The maintainer reviews the code and visual differences before merge.
7. **Release:** update changelog, Figma node manifest, token snapshot and migration notes together. Link the implementation commit. Close the proposal only when the declared deliverable is shipped or explicitly design-only.

## Versioning and deprecation

Use semantic versions: patch for compatible corrections, minor for additive tokens/components, major for removed/renamed tokens or breaking component APIs. During 0.x, still document breaking changes explicitly. Preserve original node IDs where possible. Mark replaced components `Deprecated — use …` in their description; do not delete active instances. Keep compatibility for at least two minor releases or 30 days, whichever is longer, unless an urgent defect requires a documented exception.

## Definition of ready

- Clear user purpose, when-to-use and when-not-to-use guidance.
- Default, hover, focus, active, disabled, loading and error specified or explicitly N/A; selected/open/readonly/indeterminate states where relevant.
- Native variables, code syntax and both theme values; no unresolved aliases or CSS name collisions.
- Reusable text/effect styles; auto-layout and editable instances; no clipped long labels.
- Keyboard, focus, screen reader, target-size, contrast, reduced-motion and reduced-transparency acceptance criteria.
- Empty, error, narrow-screen and real-content examples for complex components.
- Figma node, GitHub issue/PR, owner, release version, validation evidence and migration note.

## Visual do’s and don’ts

| Do                                       | Don’t                                         | Reason                                         |
| ---------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| One strong action, one quieter escape    | Two primary buttons competing in one task     | Hierarchy should reveal the next step          |
| Solid surface beneath long reading       | Low-opacity glass over moving or busy content | Readability must survive compositing           |
| Text + symbol + colour for errors        | A red outline with no explanation             | People need a correction, not just a signal    |
| 48px control targets with breathing room | Tiny icon-only hit areas                      | Touch and motor access matter                  |
| Visible label and associated helper      | Placeholder as the only label                 | Context must remain after typing               |
| Soft contours around a stable grid       | Randomly curved alignment and drifting text   | Organic material must preserve reading order   |
| Immediate contact, gentle settling       | A bounce or delay before an action executes   | Motion acknowledges intent                     |
| Consistent semantic tokens               | A sampled hex value in each component         | Changes should travel through shared decisions |

## Release record

Meridian 0.3: library/specification completion; original assets preserved, component families extended, foundations formalised and token export updated. Browser implementation and WCAG conformance remain release checks for each consuming product. Live webhook credentials are not part of this design release.
