# Foundations

## Principles

1. **Human purpose first.** Name the action and preserve progress. Validate patterns with people doing real tasks, including keyboard and assistive-technology users.
2. **Familiar shape, natural response.** Use physical cues to explain depth and contact. A control may compress subtly; text never warps. Decoration must not obscure affordances.
3. **Calm hierarchy.** One primary action per task. Proximity groups related items; space separates tasks. Keep alignment and reading order stable even where contours are organic.
4. **Ground, glass, mist.** Ground carries sustained reading. Glass marks floating controls and temporary layers. Mist stays behind content and is non-interactive.
5. **A method, not a mandatory palette.** Grass uses pine/mint and natural grounds. Paper uses warm paper, wine ink and editorial cues. See [profiles](profiles.md) for light/dark and customization rules.
6. **Equal care in both environments.** Every semantic role resolves in Grass and Paper, light and dark. Reduced motion and reduced transparency retain meaning.

## Token architecture

`primitive → semantic role → component → product theme`. Primitives have no exposed picker scopes. Components bind colour, stroke, gap, padding, radius and elevation to semantic variables. All native code syntax uses `var(--meridian-…)`. Native aliases remain available in `figma-source.json`; `tokens.json` is the resolved interchange format.

Colours and alpha come from the generated token file; do not copy sampled screenshot colours. Feedback has foreground and background roles for success, warning, error and info. Text and an icon communicate status together. `color/border/subtle` is decorative; interactive boundaries use `color/border/control`.

Dimensions use CSS pixels. Figma stores `opacity/disabled` as **48 percent**; CSS export is **0.48**. This legacy primitive is not applied to entire disabled controls: their text uses readable semantic colours. Motion durations are stored as numeric milliseconds and exported with `ms`. Font weight, column count, z-index and scale are unitless. Font families are quoted CSS strings; easing values are validated cubic-bezier strings. No arbitrary string is emitted into CSS.

## Space, contour and control size

| Role         | Values / rule                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Spacing      | 0, 2 optical adjustment, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96px                                               |
| Rhythm       | 4px base; related controls 8–12px, group interior 16–24px, major sections 32–64px                                 |
| Radius       | none 0; xs 4; sm Grass 24 / Paper 14; md 24 default; lg Grass 32 / Paper 24; full 999 circular details            |
| Contour      | 80% Figma corner smoothing; CSS uses radius fallback unless a tested shape is available                           |
| Target       | 48 × 48px minimum for standalone controls; inline text links retain text flow with adequate separation            |
| Icons        | 24px canonical grid; 16/20px for compact inline glyphs; 2px regular strokes; rounded caps/joins; optical centring |
| Text measure | 45–75 characters; reading container max 680px; general content max 1200px                                         |
| Borders      | 1px default, 2px emphasis; focus outline 2px with 3px separation                                                  |

Decorative icons are hidden from assistive technology. Icon-only actions need accessible names and keyboard-visible tooltips. Never use an unexplained icon or colour as the only instruction. Preserve product marks; the Meridian globe is the system mark, not a replacement product logo.

## Typography

These are reference-web pairings. Semantic heading rank follows document structure, not font size. Use one H1; never skip levels to get a visual treatment. Text scales in `rem` in implementation and remains zoomable.

| Role                   | Family / style         | Size / line height          | Weight |
| ---------------------- | ---------------------- | --------------------------- | ------ |
| Display, optional hero | Fraunces Regular       | 64 / 72px                   | 400    |
| H1                     | Fraunces Regular       | 40 / 48px; mobile 32 / 40px | 400    |
| H2                     | Manrope Bold           | 28 / 36px                   | 700    |
| H3                     | Manrope Bold           | 22 / 30px                   | 700    |
| H4                     | Manrope SemiBold       | 20 / 28px                   | 600    |
| H5                     | Manrope SemiBold       | 18 / 26px                   | 600    |
| H6                     | Manrope SemiBold       | 16 / 24px                   | 600    |
| Subtitle               | Manrope Medium         | 18 / 28px                   | 500    |
| Body large             | Manrope Regular        | 20 / 30px                   | 400    |
| Body                   | Manrope Regular        | 16 / 26px                   | 400    |
| Reading                | Newsreader Regular     | 20 / 32px                   | 400    |
| Button                 | Manrope SemiBold       | 14 / 20px                   | 600    |
| Label                  | Manrope Medium         | 14 / 20px                   | 500    |
| Caption                | Manrope Regular        | 12 / 18px                   | 400    |
| Code                   | JetBrains Mono Regular | 13 / 22px                   | 400    |

Letter spacing is 0 for these roles; do not reduce body tracking. Avoid all-caps paragraphs. Captions cannot carry required instructions. Existing Display/Heading/Body styles remain valid compatibility roles.

## Responsive grid

| Viewport    | Columns | Gutter | Outer margin                | Behaviour                                                             |
| ----------- | ------- | ------ | --------------------------- | --------------------------------------------------------------------- |
| 320–767px   | 4       | 16px   | 16px                        | Single task column; sidebar becomes drawer; actions stack when needed |
| 768–1023px  | 8       | 24px   | 32px                        | Two related panels when each remains readable                         |
| 1024–1439px | 12      | 24px   | 48px minimum                | Content max 1200px; persistent sidebar only if content remains usable |
| 1440px+     | 12      | 24px   | Centred max-width container | Add outer breathing room, not longer reading lines                    |

Breakpoints are 768, 1024 and 1440px. Use content-driven wrapping between them. At 320 CSS px and 400% zoom, the page has no two-dimensional scrolling except necessary data tables/maps. DOM and visual order must agree; avoid absolute positioning for text groups.

## Material, elevation and layering

Light comes from above. A raised surface is lighter than its ground in both environments. Shadows confirm elevation; they do not replace clear boundaries.

| Elevation | Shadow geometry | Use                               |
| --------- | --------------- | --------------------------------- |
| Ground    | none            | Long reading, canvas, input wells |
| Raised    | 0 4px 12px 0    | Cards, restrained hover lift      |
| Floating  | 0 12px 32px 0   | Popovers, floating controls       |
| Overlay   | 0 24px 64px 0   | Modal surfaces                    |

Grass shadow colour is #101F26 at 14% in Dawn and 32% in Dusk. Paper uses warm night shadows through the same role. Glass blur: subtle 12px, standard 20px, liquid 32px. Use the existing Glass effect styles with semantic glass/edge colours. Do not place large moving text or a dense table behind translucent reading content. When blur or transparency reduction is unavailable/selected, use opaque `color/bg/surface` or `color/bg/overlay`, preserving the border and hierarchy.

| Layer          | z-index |
| -------------- | ------- |
| Base           | 0       |
| Raised content | 10      |
| Sticky header  | 20      |
| Dropdown       | 30      |
| Modal scrim    | 40      |
| Dialog         | 50      |
| Toast          | 60      |
| Tooltip        | 70      |

Use local stacking contexts deliberately. A tooltip belonging to a modal stays within that modal's stacking/focus context. Never solve overlap by inventing arbitrary z-index values.

## Motion

| Primitive | Value                          | Behaviour                                          |
| --------- | ------------------------------ | -------------------------------------------------- |
| Contact   | 80ms                           | Immediate acknowledgement, optional scale 0.98     |
| Hover     | 140ms                          | Light/elevation response, at most 2px displacement |
| Release   | 220ms                          | Return gently; never delay the action              |
| Overlay   | 320ms                          | Arrival/departure of temporary context             |
| Reduced   | 0ms                            | Immediate state change; static progress text       |
| Settle    | cubic-bezier(0.2, 0.8, 0.2, 1) | Respond and settle                                 |
| Enter     | cubic-bezier(0.16, 1, 0.3, 1)  | Context arriving                                   |
| Exit      | cubic-bezier(0.4, 0, 1, 1)     | Context leaving                                    |

Animate transform and opacity preferentially. Do not animate blur across full screens, use perpetual floating decorations, flash, or distort text. Pointer-local highlights/refraction require a measured browser implementation; Figma's state transitions are specifications, not optical simulation. Honour `prefers-reduced-motion`; provide a product setting for reduced transparency as well as platform support. Loading skeletons must become static in reduced motion.

## Accessibility contract

Target **WCAG 2.1 AA**, with a 48px target recommendation beyond that baseline. This is a design requirement, not certification.

- Normal text ≥4.5:1. Large text (24px regular or about 18.67px bold) ≥3:1. Essential icons, control boundaries, focus/selection indicators ≥3:1 against adjacent colours. Disabled controls are exempt from WCAG contrast but their unavailability must remain understandable.
- Check both themes and every hover/active/error surface. For glass, composite against the actual background first; if contrast cannot be guaranteed, use the opaque fallback.
- Keyboard: visible 2px focus indicator with 3px separation; logical order; no traps except an open modal; no hover-only actions. Focus must remain visible when sticky regions or overlays appear. Escape closes temporary context and focus returns to the opener.
- Inputs have persistent labels, helper/error associations, `aria-invalid` when appropriate and fieldsets/legends for grouped choices. Never replace a label with placeholder text or communicate error only by red.
- Dialogs have an accessible name, focus containment and restoration. Toasts use a polite status announcement; urgent blocking errors may use alert. Do not announce every animation frame or keystroke.
- Allow 200% text zoom and 400% browser zoom, test 320px reflow, and preserve content under user text-spacing overrides (1.5 line height, 2× paragraph spacing, .12em letter spacing, .16em word spacing).
- Every drag operation has a keyboard or direct-entry alternative. Time-limited notices pause on hover/focus; essential messages persist. Skeletons are decorative; the region has a single busy label.
- Before release: keyboard-only traversal, screen reader checks, both themes, contrast measurements, zoom/reflow, touch target inspection, reduced motion/transparency, and error recovery. Automated checks supplement manual testing.
