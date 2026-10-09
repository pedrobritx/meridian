# Meridian Figma reorganisation · Living Environments & Universal Components

**Date:** 9 October 2026  
**Design authority:** [00 · Meridian · Start (node 7:2)](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=7-2). **Status:** Figma 0.6 refactor, review required before stable release.

The user-approved original Grass/Start design is the visual source: humane editorial typography, soft organic radii, gentle depth, muted boundaries, restraint in translucent chrome, opaque content and clear focus. Do **not** substitute the rejected Forest Concept B or experimental photorealistic glass as the design foundation.

## New Figma navigation

The file was reorganised **in place** into 26 pages; existing page IDs, master IDs, and the Start frame were preserved. Pages, all IDs, and library coverage are recorded in [the Figma page/contract map](../design/meridian/figma-refactor-map.json).

| Page | Purpose / actual Figma node |
| --- | --- |
| [00 Start](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=7-2) | Approved visual grammar; untouched |
| [01 Foundations](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=3-207) | Colour, type, layout, motion, elevation, usage guidelines |
| [02 Living Environments](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=267-38) | Five environments × Dawn/Dusk, all token-bound |
| [03 Actions](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=276-35) | Ten linked mature component sources |
| [04 Input & Selection](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=270-35) | Twelve linked universal patterns plus stable input sets |
| [05 Navigation & Overlays](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=271-35) | Thirteen linked universal patterns |
| [06 Data & Collections](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=271-3160) | Fifteen linked universal patterns |
| [07 Feedback & Progress](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=271-3308) | Twelve linked universal patterns |
| [08 Advanced Components](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=273-35) | Sixteen new composite masters with semantically appropriate state variants |
| [09 Product Workflows](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=271-3428) | Twenty-four product-domain specimens |
| [10 Semantic Icons](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=274-34) | Eighty glyph families; Outline, Filled, Colour, Duotone |
| 11–12 | Existing patterns, governance and adoption |
| 13–19 | Original and universal master *source* pages; instances remain linked |
| 20–22 | Core, Forest (legacy Grass) and Desert (legacy Paper) profile studies |
| 90–92 | Living Matter research and archived exploratory concepts |

Indexes instantiate existing masters; **they are not new duplicate masters**. All 92 universal masters on source page `247:8` use the `Meridian / Living Environments · 0.6` collection; the original stable Core masters retain their IDs and legacy token bindings.

## Environment system

Source: [living-environments.json](../design/meridian/living-environments.json). Figma collection: `Meridian / Living Environments · 0.6` (`VariableCollectionId:266:34`).

Each of five environments has Dawn/Dusk, **35 semantic colour roles + four decorative light roles**:

- **Forest** — the exact approved original Grass palette, not a redesign; canopy, filtered daylight, organic forms
- **Desert** — the exact original Paper palette, not a redesign; sand, parchment, warm stone
- **Aurora** — pale mint/luminous violet by day; indigo space, emerald and quiet magenta at night
- **Glacier** — crisp arctic white, frost blue and icy navy with cyan highlights
- **Embers** — toasted ash and warm whites by day; charcoal, ember-crimson and warm orange at night

The CSS generator `scripts/build-environments.mjs` creates `styles/living-environments.css`; the new semantic selectors are opt-in via `data-meridian-environment`. Grass/Paper remain accepted as compatibility names by the stable 0.5 code and bridge. Do not rename the legacy Figma colour modes or stable generated token keys without a separately reviewed migration.

Core accessibility roles (text, surfaces, focus, status and actionable contrast) are distinct from `ambient/*` decorative colours. Any glow, material layer, motion or blur is non-essential; use opaque fallback for dense content. Contrast tests cover specified *opaque* colour pairs only, not uncontrolled glass or arbitrary imagery.

### Why not rename stable Figma modes immediately?

The token bridge expects the precise original six-mode `Meridian / Colour` collection and twelve published mode aliases. Renaming `Grass / Dawn` or `Paper / Dusk` directly would make currently exported product tokens fail. The new collection is the 0.6 universal library's default and the legacy 0.5 collections remain compatible.

## Component anatomy and usage

- **Actions:** Button, Icon Button, Link, Button Group, segmented controls and safe glass/opaque alternatives. Use actual mature component variant sets.
- **Form controls:** Text Field, Search, Combobox, Select, Checkbox, Radio, Switch, Text Area, Date Picker, Calendar, Range, Token Field, Numeric Stepper, File/Image wells. Native semantics and label/error contracts remain essential.
- **Navigation:** Header, Sidebar, Tabs, Breadcrumbs, Bottom Navigation, Menus, Context Menu, Drawer, Sheet, Carousel, Column and Scroll Views.
- **Data:** Data Table, List, Collection, Card, Metric, Chart, Timeline, Avatar, Chip, Divider, Citation, File Preview.
- **Feedback:** Alert, Toast, Banner, Dialog, Loading, Skeleton, Progress Bar/Ring, Status, Error/Retry, Confirmation, Offline, Notifications and Privacy.
- **Workflows:** Domain-specific records for Lexis, Verbalis, NotUX, Framio, Ambientis, condominium, Via and media tools. Apps own authoritative data, retention and processing logic.

New source data: [extended patterns](../design/meridian/universal-extended.json). New masters have relevant variants (e.g. Sheet Open/Loading/Error, Progress Ring Determinate/Indeterminate/Complete/Error). Static Divider does **not** have meaningless hover/pressed variants. The full suite remains an *experimental design resource*, not a certified web component package.

## Iconography

Source paths: [80 original SVG symbols](../design/meridian/universal-symbols.json). Existing outline masters on Figma page `245:8` remain intact.

The new editable page contains 80 independent native `COMPONENT_SET` families with styles **Outline / Filled / Colour / Duotone**. A reusable [Figma builder](../scripts/figma/build-universal-iconography.js) provides repeatable generation. Icons retain their original 24px grid and rounded cap/join geometry. Stroke/fill colours are bound to the 0.6 environment collection. Respect silhouette recognition; pair ambiguous icons with visible or accessible labels, avoid relying on colour alone, and test recognition at reduced sizes.

## Sync and release gates

- **GitHub → Figma:** tokens, source manifests, accessible contracts, page/master ID mapping. The existing 0.5 bridge remains the managed stable sync.
- **Figma → GitHub:** new page geometry, renamed studies and 320 icon style variants have been authored directly in the Figma file. The metadata map documents them; the ordinary REST API does not maintain arbitrary component layout automatically.
- **Verification:** run `npm test`, `npm run build`, `npm run test:browser`, confirm generated-file cleanliness and inspect mobile/desktop screenshots. Perform actual keyboard/assistive-technology and representative-device work separately.
- **Do not claim stable release:** manual accessibility and human-study evidence under issue [#12](https://github.com/pedrobritx/meridian/issues/12) are outstanding. No consuming product should be automatically migrated based on this Figma reorganisation.
