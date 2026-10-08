# Living Controls — Meridian Lab 0.6

**Status:** Experimental prototype; **not a stable component package**.  
**Experiment IDs:** LM-01 magnetic attraction, LM-02 liquid selection, LM-03 elastic contact.  
**Figma:** [Editable Living Matter board](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=182-35).  
**Tracking:** [Issue #9](https://github.com/pedrobritx/meridian/issues/9), [Lab charter](../README.md), [Hypotheses](../../research/hypotheses/living-matter.md).

## Try the prototype

From the repository root:

```sh
npm ci
npm run dev
# Open http://127.0.0.1:5173/meridian/lab/living-controls/
```

Or test the production build:

```sh
npm run build
npm run preview -- --port 4173
# Open http://127.0.0.1:4173/meridian/lab/living-controls/
npm run test:browser
```

Once the reviewed branch is merged and deployed, it will be available at `https://britx.me/meridian/lab/living-controls/`. A PR alone does **not** deploy the new page to production; inspect GitHub Actions checks on the draft PR.

## Behaviour and constraints

- **Baseline A:** Native button activation without physical enhancement.
- **LM-01 magnetic attraction:** Only an inner visible face is translated in response to pointer position. The focusable/clickable outer `<button>` and its hitbox remain fixed; keyboard and touch still activate natively.
- **LM-02 liquid selection:** A native fieldset and three radio controls own the selection state; the moving indicator is entirely presentational. Arrow-key navigation remains native.
- **LM-03 elastic contact:** Pressed feedback has a short compression and spring-like release. Activation occurs immediately on click/keyboard and is never delayed for animation.
- **Preferences:** `prefers-reduced-motion`, forced colours, manual effect toggle and zero intensity disable decorative motion, not interaction. CSS supplies additional reduced-transparency and higher-contrast treatments.
- **Tokens:** Import existing generated `styles/tokens.css` and `styles/components.css`; no change to canonical Figma tokens, component variants or stable 0.5 reference.
- **Privacy:** No telemetry, backend, analytics, local storage or user data collection.

## Testing

`tests/browser/living-controls.spec.js` checks completion, native radios, keyboard selection, effect off/OS reduced motion, no horizontal overflow and axe WCAG A/AA automation across existing desktop/mobile Chromium test projects. Automation cannot establish full accessibility: manual Safari/Firefox and assistive-technology review remain future gates.

## What this cannot prove

This is an interactive visual experiment, not evidence that magnetic attraction or spring compression universally improves discoverability, efficiency, wellbeing or accessibility. Each hypothesis remains *speculative* until validated in an explicitly scoped study.

## Next work

- Obtain formative user-study results and verify on representative hardware.
- Add documented motion intensity presets or measured spring parameters only after evaluation.
- Implement Living Workspace and Living Environments in separate Lab milestones.
- Do not promote effects to stable Meridian Design/React components without BSDL ethical, engineering and accessibility review.


## LM-02 fusion experiment (additional to liquid selection)

A second LM-02 specimen uses two purely decorative liquid masses. Native `Separated` / `Merged` radio choices control a true geometric join-and-separate animation; a blur/threshold SVG filter suggests fluid continuity. **No hitboxes, action meanings or DOM controls merge.** Reduced motion removes transitions; forced colours suppresses the decorative mass while preserving meaningful native selection. This is a perception experiment, not a validated performance enhancement.
