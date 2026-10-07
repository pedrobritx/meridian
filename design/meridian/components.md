# Component behaviour and state matrix

Every checklist component has a seven-state contract. A dash is an explicit N/A rule, not missing work. Composite states belong to a named child action or data region. Checkbox and Radio/Switch expose independent Selected and State axes in Figma (21/14/14 variants), including mixed checkbox selection. Selection and press remain separate in production. Native controls and WAI-ARIA patterns supply runtime semantics.

| Component                                          | Default | Hover | Focus | Active       | Disabled     | Loading | Error |
| -------------------------------------------------- | ------- | ----- | ----- | ------------ | ------------ | ------- | ----- |
| Button — Primary / Secondary / Quiet / Destructive | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Text field (Field)                                 | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Icon button                                        | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Link                                               | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Button group                                       | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Text area                                          | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Select                                             | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Checkbox                                           | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Radio                                              | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Switch                                             | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Date picker                                        | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Slider                                             | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Header                                             | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Sidebar                                            | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Breadcrumbs                                        | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Tabs                                               | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Pagination                                         | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Stepper                                            | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Data table                                         | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Card                                               | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Badge / Tag                                        | ✓       | N/A   | N/A   | N/A          | N/A          | ✓       | ✓     |
| Avatar                                             | ✓       | N/A   | N/A   | N/A          | N/A          | ✓       | ✓     |
| Accordion                                          | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Tooltip                                            | ✓       | ✓     | ✓     | N/A          | N/A          | N/A     | N/A   |
| List                                               | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Dialog                                             | ✓       | ✓     | ✓     | ✓            | ✓            | ✓       | ✓     |
| Toast                                              | ✓       | ✓     | ✓     | Child action | Child action | ✓       | ✓     |
| Banner                                             | ✓       | ✓     | ✓     | Child action | Child action | ✓       | ✓     |
| Progress bar                                       | ✓       | N/A   | N/A   | N/A          | N/A          | ✓       | ✓     |
| Spinner                                            | ✓       | N/A   | N/A   | N/A          | N/A          | ✓       | N/A   |
| Skeleton                                           | ✓       | N/A   | N/A   | N/A          | N/A          | ✓       | N/A   |

## Button — Primary / Secondary / Quiet / Destructive

Use one primary action per task; Secondary supports it, Quiet is the tertiary action. Destructive is reserved for irreversible change. Active maps to existing Pressed variants. Error is a retry action with a nearby persistent failure message. Never use a button for ordinary navigation.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Text field (Field)

Use for one short value. Existing Field variants preserve their IDs; Hover, Active/editing and Loading/validation complete them. Error keeps the value and explains the correction. Readonly remains focusable and copyable; disabled is unavailable. Never use placeholder text as the label.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Icon button

Use for a familiar repeated action with a visible tooltip and accessible name. Do not use an unfamiliar symbol as the only explanation. 48 × 48 target; Active = press; Error = retry action with nearby persistent explanation.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Link

Use for navigation. Underline prose links; retain a visited colour. Do not use links to submit forms. Active = press; disabled removes navigation and explains why; loading preserves the label; errors provide a retry destination.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Button group

Use for related actions, with one primary action and a quiet escape. Do not group unrelated destinations. Focus and loading belong to the affected child; keep Cancel usable during cancellable work. Wrap vertically on narrow screens.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Text area

Use for multi-line notes; visible label, minimum 112px well and resize support. Do not use for a short structured value. Active = editing; loading = async validation without clearing text. Error text names the correction and remains associated.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Select

Use for one choice from a known list. Prefer native select for simple forms; use a combobox for long searchable lists. Active = open list; Enter/Space opens, arrows move, Escape closes and restores focus. Do not hide the label in a placeholder.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Checkbox

Use for independent choices. Active = press; Selected = Off / On / Mixed; mixed selection needs an indeterminate mark. Space toggles; label is clickable. Loading only for immediate persistence; ordinary form checkboxes do not load. Do not use for mutually exclusive options.

| State    | Specification                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                                                                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                                                                                                                                                             |
| Focus    | Visible focus on the actual interactive control.                                                                                                                                                               |
| Active   | Press feedback is independent of the Selected axis; selection is retained when focus moves. Space toggles checkbox/switch; radio arrows select. Press feedback must not change the meaning of the saved value. |
| Disabled | Unavailable action is prevented and explained; no hover activation.                                                                                                                                            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                                                                                                 |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                                                                                           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Radio

Use for one of a small visible set. Active = press; Selected = Off / On; arrows move and select within a labelled group, Tab enters once. Loading applies only to async options. Error belongs to the group. Do not use one radio as a boolean switch.

| State    | Specification                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                                                                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                                                                                                                                                             |
| Focus    | Visible focus on the actual interactive control.                                                                                                                                                               |
| Active   | Press feedback is independent of the Selected axis; selection is retained when focus moves. Space toggles checkbox/switch; radio arrows select. Press feedback must not change the meaning of the saved value. |
| Disabled | Unavailable action is prevented and explained; no hover activation.                                                                                                                                            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                                                                                                 |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                                                                                           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Switch

Use for an immediately applied on/off preference. Active = press; Selected = Off / On; thumb position and text convey state. Space toggles. On failure restore the prior value and show retry guidance. Use checkbox when changes wait for Submit.

| State    | Specification                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                                                                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                                                                                                                                                             |
| Focus    | Visible focus on the actual interactive control.                                                                                                                                                               |
| Active   | Press feedback is independent of the Selected axis; selection is retained when focus moves. Space toggles checkbox/switch; radio arrows select. Press feedback must not change the meaning of the saved value. |
| Disabled | Unavailable action is prevented and explained; no hover activation.                                                                                                                                            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                                                                                                 |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                                                                                           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Date picker

Use for a calendar date with typed-entry fallback and visible format DD / MM / YYYY. Active = calendar open. Arrows move day, Home/End week, Page Up/Down month; Escape closes. Announce locale and disabled-date reasons. Do not use for duration.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Slider

Use for a bounded approximate value with a visible current value and numeric alternative. Active = drag. Arrows step, Home/End reach bounds. Loading = apply in progress; Error retains the last valid value. Do not require dragging for precision.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Header

Use one global header with stable navigation and a skip link in code. States apply to a child control; Active = current destination or expanded menu. Keep navigation available during page loading and contextual errors. Collapse into a labelled menu on mobile.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Sidebar

Use for a stable set of peer destinations in a workspace. States apply to the affected item. Mark current with aria-current=page. On mobile use a dismissible drawer with focus return. Do not combine unrelated global and local navigation without headings.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Breadcrumbs

Use for location within a real hierarchy. Current page is text, ancestors are links; separators are decorative. States belong to an ancestor link; loading/error must not erase the trail. Do not use as a linear task stepper.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Tabs

Use for peer panels in the same context. Active = selected panel; arrow/Home/End move focus, Enter activates when loading is slow. Use tablist/tab/tabpanel relationships. Loading/error belongs to the panel, not an empty tab bar. Use links for routes.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Pagination

Use for bounded result sets with total count and current page. Active = selected page. Disable previous/next only at bounds; preserve current rows during loading and retry errors. Reset to page one when filters change. Do not rely on tiny page-number targets.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Stepper

Use for three or more named stages. Active = current stage, check = completed. Only completed stages may become links. Loading belongs to progression; Error marks the affected stage and focuses its summary. Do not imply future stages are already complete.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Data table

Use for comparing structured records. Sort headers are buttons with aria-sort; Active = ascending sort. Row controls receive focus/disabled states. Provide caption, header scope and pagination; preserve headers while loading. Error has retry. On mobile scroll the table region, not the page.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Card

Use for one coherent content unit with a heading and an explicit action. Hover/focus/active belong to that action unless the entire card is one link. Use solid reading surfaces. Loading preserves footprint; Error explains retry. Do not nest links inside a clickable card.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Badge / Tag

Use for short status metadata with text plus a symbol. A static badge has no hover, focus, active or disabled state; interactive filter chips are buttons. Loading means the status is pending; Error is a labelled failed status. Do not use colour alone.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                |
| Hover    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Focus    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Pending metadata or image placeholder. Keep the surrounding layout and accessible identity stable.                                        |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                      |

**Implementation acceptance:** No keyboard focus for the static indicator; verify text alternative and loading/error replacement.

## Avatar

Use for identity; show initials when an image is missing or fails. Static avatars have no hover, focus, active or disabled state. Put them inside an accessible button only when opening a profile action. Avoid redundant alt text next to the same visible name.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                |
| Hover    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Focus    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Pending metadata or image placeholder. Keep the surrounding layout and accessible identity stable.                                        |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                      |

**Implementation acceptance:** No keyboard focus for the static indicator; verify text alternative and loading/error replacement.

## Accordion

Use for optional related details. Active = expanded; Enter/Space toggles a button with aria-expanded and aria-controls. Loading/error stays inside the panel with retry. Do not hide required instructions or validation errors inside a collapsed panel.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Tooltip

Use for brief supplemental text shown on hover and keyboard focus. Default specimen depicts its content; at rest it is hidden. Escape dismisses; remains hoverable and persistent. Active, disabled, loading and error are N/A. Never place actions or essential instructions in a tooltip.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Hidden at rest; the Figma Default variant is the content specimen. Show on hover or focus of a labelled trigger.                          |
| Hover    | Pointer feedback; does not replace keyboard focus.                                                                                        |
| Focus    | Visible focus on the actual interactive control.                                                                                          |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Error    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## List

Use semantic list markup for related items. States apply to interactive rows or child actions; static text has no interaction states. Active = temporary row press; selection is a separate product concern. Loading retains structure; Error gives retry. Use a table when column comparison is the primary task.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Dialog

Use for a focused decision that requires interruption. Hover/focus/active/disabled apply to child actions. Label the dialog, contain focus, Escape closes, return focus to opener. Loading prevents duplicate submission; Error stays inside with preserved data. Avoid stacked dialogs.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Pressed/open/selected meaning is specified in the usage contract.              |
| Disabled | Unavailable action is prevented and explained; no hover activation.            |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Toast

Use for non-critical confirmation with optional Undo. Hover/focus pauses dismissal; actions receive focus. Active/disabled belong to a child action, not the message. Errors needing action stay until resolved. Announce once with role=status; do not put required instructions only in a toast.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Use the nested Button state; the message itself has no active state.           |
| Disabled | Use the nested Button state; the message itself has no disabled state.         |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Banner

Use for persistent contextual information or recovery. Hover/focus apply to its action; active/disabled use the child button states. Error explains what happened and how to recover. Do not interrupt a whole page for a field-only error.

| State    | Specification                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| Default  | Available, clearly labelled resting state.                                     |
| Hover    | Pointer feedback; does not replace keyboard focus.                             |
| Focus    | Visible focus on the actual interactive control.                               |
| Active   | Use the nested Button state; the message itself has no active state.           |
| Disabled | Use the nested Button state; the message itself has no disabled state.         |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission. |
| Error    | Persistent text explains correction or retry; preserve entered data.           |

**Implementation acceptance:** Verify accessible name, keyboard operation, focus visibility, both themes, long labels, narrow layout and recovery before release.

## Progress bar

Use determinate progress only when the total is known. Default shows 60%; Loading may be indeterminate; Complete is 100%. Expose value, min/max and label; error stops progress and offers retry. Hover, focus, active and disabled are N/A for the indicator.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                |
| Hover    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Focus    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                            |
| Error    | Persistent text explains correction or retry; preserve entered data.                                                                      |

**Implementation acceptance:** No keyboard focus for the static indicator; verify text alternative and loading/error replacement.

## Spinner

Use for short indeterminate waits after 300ms, with a useful text label. Default/Loading represent activity; reduced motion uses a static indicator and text. Hover/focus/active/disabled/error are N/A; replace with a persistent error and retry when work fails.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                |
| Hover    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Focus    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                            |
| Error    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |

**Implementation acceptance:** No keyboard focus for the static indicator; verify text alternative and loading/error replacement.

## Skeleton

Use only when the shape of incoming content is known. Default/Loading reserve that space; reduced motion has no shimmer. Hide decorative blocks from assistive technology and label the busy region. Hover/focus/active/disabled/error are N/A; replace with an error or empty state.

| State    | Specification                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Available, clearly labelled resting state.                                                                                                |
| Hover    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Focus    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Active   | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Disabled | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |
| Loading  | Preserve dimensions and work; label progress and prevent duplicate submission.                                                            |
| Error    | Not applicable to this static/presentational surface. Use the parent control or replace the indicator with a persistent recovery message. |

**Implementation acceptance:** No keyboard focus for the static indicator; verify text alternative and loading/error replacement.

## Meridian 0.4 interaction corrections

See [profiles and interaction contract](profiles.md): segmented selection owns label weight; choice selection survives hover; list rows have independent temporary hover/press with radius 24; disabled controls retain readable labels. Figma profile labs use linked instances.
