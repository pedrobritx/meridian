# Living Workspace — Meridian Lab 0.6

**Research experiments:** LM-04 spatial continuity, gravity and inertia; LM-05 viscosity; LM-06 atmospheric glass.
**Status:** Exploratory, not stable Meridian components.
**Related:** [Issue #10](https://github.com/pedrobritx/meridian/issues/10) · [Figma study](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=190-35) · [Hypotheses](../../research/hypotheses/living-matter.md).

## Launch

```bash
npm ci
npm run dev
# http://127.0.0.1:5173/meridian/lab/living-workspace/
```

## LM-04 — Spatial continuity with inertial attraction

The accessible panel supports open, close, focus restoration and keyboard-operated tabs. A separate attraction field has three **native** radio anchors: West, Center and East.

The visible, aria-hidden mass uses a bounded, damped spring/attractor model in `lab/physics/attraction.mjs`. Its position accelerates, overshoots and settles at the selected anchor. Selecting an anchor updates native radio state and visible status immediately; no one must wait for visual movement or drag an object.

Reduced motion, forced colours and the manual expressive-effects switch snap the mass immediately to the anchor. Browser resizing also recalculates the positions without changing native selection. Tests cover keyboard selection, motion-off behaviour, spatial state and the integrator's overshoot/settling.

This is an **experimental gravity metaphor**, not an exact astronomical simulation or demonstrated usability benefit.

## LM-05 — Viscosity

The native range input changes a decorative surface's width, with responsive shape transitions when motion is allowed. No direct dragging is required for task completion.

## LM-06 — Atmospheric glass

The inspector panel offers a glass treatment and an opaque fallback, with system preference accommodation. Automated WCAG audits do not establish real-world glass contrast on complex backgrounds.

## Evidence and promotion

Tests: `npm test`, `npm run build`, `npm run test:browser`. Relevant browser suite: `tests/browser/living-workspace.spec.js` and `tests/browser/living-matter-physics.spec.js`; integrator tests: `tests/living-matter-motion.test.mjs`.

No experiment is promoted to stable Meridian Design without human-task research, documented performance on named devices, accessibility evaluation and BSDL ethical review. See [research protocol](../../research/studies/living-matter-formative-protocol.md) and [issue #12](https://github.com/pedrobritx/meridian/issues/12).
