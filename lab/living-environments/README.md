# Living Environments — Meridian 0.6 / LM-H07

**Status:** Experimental. These six environmental families are not stable theme packs. **Research question:** Do environmental cues change perceived familiarity or usability in different contexts, or merely visual preference?

## Visit

- [Editable Figma board](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=197-35), six Dawn/Dusk comparisons and a separate product-identity scenario.
- Browser prototype after merge/deploy: `https://britx.me/meridian/lab/living-environments/` (not available from an unmerged PR).
- GitHub [issue #11](https://github.com/pedrobritx/meridian/issues/11), [research hypothesis LM-H07](../../research/hypotheses/living-matter.md), and [Living Matter roadmap](../../docs/roadmap/0.6-living-matter.md).

## Locally

```sh
npm ci
npm run dev
# http://127.0.0.1:5173/meridian/lab/living-environments/

npm test
npm run build
npm run test:browser
```

## Experiment variables and design contracts

| Dimension | Implementation | What must never change |
| --- | --- | --- |
| Environment | Forest, Ocean, Desert, Alpine, Storm, Celestial (optional) | Role naming, meaning, content structure |
| Appearance | System, Dawn/light, Dusk/dark; independent of environment | Input and semantics |
| Product identity | Environment-led, independent wine, independent ink | Product-owned brand has precedence |
| Material | Opaque by default; glass optional | Contrast and actions |
| Accessibility | OS forced colours, contrast, reduced transparency | Task completion, visible focus |
| Task | Three native radio choices, Confirm, Reset | Labels, hierarchy, status feedback |

All six environmental definitions are versioned in `environments.js`, not in Figma production variable modes or generated Meridian tokens. CSS custom properties `--le-*` are scoped to the experimental entry. The prototype adds no analytics, persistent settings, backend or personal data capture.

The independent product identities intentionally override the action accent without changing the environment, control roles or tasks. A product is never required to adopt Meridian's green/forest identity.

## Contrast and accessibility

- Node tests measure static **opaque foreground/surface**, **secondary text/surface**, and **action label/brand action** ratios across 6 environments × 2 appearance modes and the branded overrides, with a minimum of 4.5:1 for tested text.
- Browser tests exercise environment and mode independence, semantic equivalence, keyboard radios, action feedback, responsive overflow, selected state, forced-colour fallback and automated WCAG A/AA checks.
- The UI's live contrast diagnostics report **opaque base pairs only**. They are not a guarantee of legibility over dynamically composited glass/background layers.
- Glass is a manually enabled enhancement. A system request for reduced transparency, increased contrast or forced colours replaces it with an opaque surface.
- A no-JavaScript session displays a readable static Forest specimen; experimental controls do not function and are not presented as a fully operative Lab without JavaScript.

## Scientific boundaries

This prototype does **not** demonstrate cognitive, physiological, therapeutic, cultural or circadian benefits of any colour environment. Testing aesthetic preference alone cannot establish improved task performance.

Before stable adoption, run formative evaluations with task success, error and comprehension measurements, including participants across input needs and cultural contexts. Record negative results, conditions and limitations in [research/](../../research/) and release decisions under BSDL.

## Roadmap

- [x] Six natural environmental families with independent Dawn/Dusk.
- [x] Product identity independent from environmental treatment.
- [x] Same task and native radio semantics across treatments.
- [x] Opaque fallback and automated base-colour tests.
- [x] Editable Figma storyboard using existing Meridian Core button instances.
- [ ] CI on this branch and merge.
- [ ] Real-device contrast/compositing, screen reader and usability research — owned by issue #12.
