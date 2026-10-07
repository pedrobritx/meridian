# Audit — 6 October 2026

The prompt's input-data section was a placeholder. Evidence came from a fresh inspection of the six existing Figma pages, local variables/styles/component definitions, three current Figma screenshots, and `docs/design.md` / `apps/web/src/app/globals.css`. Reference articles informed recommendations; they were not treated as evidence of Meridian's current state.

## What was missing or incomplete

- **Foundations:** 59 exported semantic/layout/type tokens existed, but no native z-index scale, breakpoint/grid tokens, duration/easing tokens, or elevation scale. Existing colour aliases were sound; numeric values were unaliased. Code syntax mixed `--md-*` with `--meridian-*`.
- **Typography:** eight styles existed. H1–H6 roles, subtitle, dedicated button/caption styles, mobile H1 and reusable reading style were not explicit.
- **Layout and symbols:** no desktop/tablet/mobile grid specification. Symbols used a 24px grid but their 44px target note disagreed with the 48px controls documented elsewhere.
- **Accessibility:** scattered focus/keyboard notes existed; there was no consolidated WCAG 2.1 AA target, contrast test matrix, zoom/reflow protocol, overlay focus rules or reduced-transparency acceptance criteria.
- **Actions:** Button had 24 variants covering four styles and six states, with Pressed as Active. No failure/retry variants, icon-only family, link family or button-group state sheet. Quiet already fills the tertiary role.
- **Inputs:** Field had Default/Focus/Error/Disabled/Readonly. Hover/Active/Loading were missing. Choice contained only checkbox/switch selection pairs. No textarea, select, radio, date picker or slider family; no full choice-state treatment.
- **Navigation:** one Navigation item, one Tab, and three selected segmented-control states existed. No complete header, sidebar, breadcrumb, tab, pagination or stepper state families.
- **Data display:** Card and four intent badges existed. No table, avatar, accordion, tooltip or list families, and no clear state applicability rules for static content.
- **Feedback:** Alert and Dialog existed as single components. No toast, progress, spinner or skeleton families; no complete failure/loading/child-action specifications.
- **Patterns:** reading, preferences and workspace examples existed in Dawn and Dusk, including a small empty block. There were no dedicated form-error summary, global failure, 404, search/filter/zero-results, onboarding, confirmation or multi-step journey specimens.
- **Governance:** adoption advice existed; contribution ownership, review gates, versioning, deprecation, release checklist, and concrete visual do/don't comparisons were missing.
- **Integration:** bridge PR #136 is merged. Figma's Adoption board still said no automation had been configured. The export accepted only colour/float values, omitted font/easing strings, and assigned `px` too broadly to typography numbers. Live secret configuration was not verified in this audit.

## Evidence and completion map

| Audit step          | Before                              | Evidence                                                    | Completion                                                                                                                            |
| ------------------- | ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Foundations      | Partial                             | Figma `8:22`, native collections and eight text styles      | Aliased tokens, eleven additional text styles, three elevation styles, grid/type/accessibility boards                                 |
| 2. Components       | Partial                             | Figma `5:193`, Button `5:22`, Field `5:108`, Choice `5:133` | Original Button/Field extended; 29 additional documented families plus an expanded calendar panel; explicit applicable and N/A states |
| 3. Patterns         | Partial                             | Figma `8:280`                                               | Editable recovery, search/filter, onboarding and multi-step flow specimens using linked components                                    |
| 4. Governance       | Missing                             | Figma `8:420` adoption text                                 | Contribution lifecycle, release rules, visual do/don't examples and updated integration status                                        |
| 5. Token connection | Merged setup; activation unverified | PR #136; generated tokens; code syntax                      | Updated reference snapshot, safer unit-aware exporter, semantic product mapping and checks                                            |

Local capture files are `01-foundations-before.png`, `02-components-before.png`, and `03-patterns-before.png` in the task's audit workspace. The Figma links remain the durable source for review.

## Limits

Figma documents and previews states; it does not prove browser keyboard behaviour, screen-reader semantics, reflow, live data handling or optical refraction. The accompanying accessibility checks cover specified opaque token pairs. Glass must be retested against actual composited backgrounds. Publishing library updates, activating provider secrets and shipping product components are separate release actions.

## Validation of this snapshot

- 25 Node tests pass, including execution of the actual export plugin against the native variable snapshot, CSS reproducibility, alias resolution, unit validation and webhook/sync orchestration.
- 62 opaque contrast combinations across Dawn and Dusk meet the specified AA thresholds. See `contrast-report.json`; this does not certify full accessibility.
- Visual review covered core foundations, checkbox selection, date/calendar, slider, button group, table, dialog, all five flow boards and visual usage guidance. Corrected overflow in the original environment row and new action groups. The final structural inventory reports no auto-layout child overflow across the nine pages.
- Figma state and flow specimens demonstrate the design contract; production keyboard, assistive-technology, composited glass and persistence behaviour remain implementation acceptance checks.

## 0.4 follow-up — 7 October 2026

User adjustments established 24px as the default rounded contour. The green reference is now Grass; Paper adapts the shared system to Lexis. Existing manual design adjustments were retained except where the specified state/contrast/radius contract required a correction.

- Rebuilt segmented-control owned labels to prevent nested text-style overrides persisting across selection. Native instance round trips Overview → Materials → Motion → Overview retained exactly one Bold label.
- Added a shared list-item family with independent hover/press, stable label properties and 24px radius. Label round trips Default → Hover → Active → Default retained a custom label. Choice hover now preserves selection; selected radio activation does not toggle it off.
- Corrected foreground/background state pairing and removed whole-control disabled opacity. The four-mode token matrix contains 124 passing contrast pairs. A solid-paint/semantic-colour audit also checked 2,114 text nodes across component and demonstration pages in all four modes with no pair below 4.5:1. This model does not certify composited effects or browser accessibility.
- Added return, recovery, creation and simulated deletion destinations. Structural validation found no invalid destinations or unmapped primary flow buttons in the inspected prototype frames. All eight inspected component/flow/profile pages passed auto-layout overflow checks after the mobile segmented-width correction.
- Added editable Grass/Paper light/dark workspaces, detail/return paths, interaction labs and a profile guide. The export now includes all four modes and profile-specific shape/motion values.

Evidence: `interaction-report.json`, `contrast-report.json`, the 0.4 Figma manifest and [profile documentation](profiles.md). Native instance tests exercise variant changes, not the Figma presentation player. Pointer playback, browser keyboard interaction, glass compositing and real persistence remain runtime checks.
