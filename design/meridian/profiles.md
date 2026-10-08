# Meridian profiles — 0.5

Core is the neutral baseline. Grass is green and Paper is sand/wine. Three additional profiles fit the confirmed project workflows.

| Profile | Purpose | Type | Compact / medium / large radius |
| --- | --- | --- | --- |
| Core | Neutral shared foundation | Manrope | 12 / 16 / 24px |
| Grass | Environmental evidence; Ambientis Terra proposal | Manrope | 24 / 24 / 32px |
| Paper | ESL learning; Lexis | Fraunces / Newsreader / JetBrains Mono | 14 / 24 / 24px |
| Parallel | CAT translation; Verbalis | Geist / Geist Mono | 8 / 12 / 16px |
| Canvas | Interactive teaching whiteboard; NotUX | Inter specimen; product SF/system font | 8 / 16 / 18px |
| Gallery | Online museum; Framio | Cormorant Garamond / Inter | 8 / 12 / 16px |

See [purpose, colour, symbol and source evidence](../../docs/adoption.md). Each profile has Dawn and Dusk appearances; errors, pending review, focus and disabled controls retain their semantic meaning.

## Apply in Figma

Set **Colour, Layout, Motion and Typography** modes on the outer frame. Figma limits a collection to ten modes, so two complementary colour collections support the twelve appearances:

- **Meridian / Colour:** Core, Grass and Paper, each with “Profile / Dawn” and “Profile / Dusk”. Use the existing Button and Button / Glass sets.
- **Meridian / Project Colour:** Parallel, Canvas and Gallery, each with “Profile / Dawn” and “Profile / Dusk”. Use Button / Project and Button / Project Glass. These adapt the same linked state contract to the second colour collection; they are not separate per-product libraries.
- **Meridian / Layout, Motion, Typography:** choose the same profile name. The old Typography Value mode is retained for existing specimens. Elevation remains shared.

Original Grass/Paper colour IDs and existing component IDs remain intact. Project components remap colour bindings, keep state destinations within their sets, and bind label family/weight to the shared typography roles. The code role uses Geist Mono in Parallel and JetBrains Mono elsewhere.

[Figma foundations](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=138-34) · [project specimens](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=162-58) · [glass states](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=139-206)

## Glass and interaction

Button / Glass and Button / Project Glass offer Glass and Opaque, each with Default, Hover, Focus, Pressed, Disabled, Loading and Error. Targets are 48px and focus rings are 3px with a separate gap. Native glass uses restrained refraction, no colour dispersion and a protective tint of at least 96%. Opaque removes blur/refraction. Error, loading and disabled options use solid surfaces.

Web glass uses backdrop blur with the same protective tint; native refraction is a Figma effect. Reduced transparency, increased contrast and forced colours use solid controls. Reduced motion removes spatial movement and spinner animation. Dense segments, drawings, lessons, artworks and compliance evidence stay opaque. Validate focus over controlled surfaces and choose Opaque over backgrounds that have not been checked.

Selected-only bold segments, row-owned list feedback, explicit error/loading/disabled semantics and native keyboard activation remain shared requirements. Figma demonstrates state changes; the reference website tests browser focus, tabs, dialogs and keyboard activation.

## Export and adoption

The bridge exports **168 semantic roles per appearance** across twelve modes. Grass retains legacy export keys Dawn/Dusk; the other profiles use PaperDawn/PaperDusk, CoreDawn/CoreDusk, ParallelDawn/ParallelDusk, CanvasDawn/CanvasDusk and GalleryDawn/GalleryDusk. Alias resolution chooses the correct colour collection plus profile layout, motion and typography. Unsupported or missing profiles fail explicitly.

```html
<main data-meridian="parallel" data-theme="light">…</main>
<main data-meridian="gallery" data-theme="dark">…</main>
```

Specify both attributes for independent boundaries. Legacy unprofiled root/dark selectors remain Grass-compatible. The reference site defaults to neutral Core and remembers profile preferences.

Lexis uses HSL channel triplets; Meridian exports complete rgb() colours. Convert deliberately during adoption. Paper’s 24px reference radius differs from the application’s existing 14px base. This release saves library decisions and a reference implementation, not an automatic product migration.

Text requires 4.5:1; meaningful boundaries and focus require 3:1. The committed contrast report includes solid surfaces and glass composites over the declared surfaces and black/white extremes. Native refraction or arbitrary imagery still requires context-specific inspection; opacity does not replace an opaque fallback.
