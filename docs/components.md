# Component recipes

Load `styles/tokens.css` and `styles/components.css`. The live Components view shows these primitives and their observable behaviour; `src/main.js` demonstrates local event handling. These are native HTML/CSS recipes rather than framework-specific APIs.

| Figma family | Web contract | States / behaviour |
| --- | --- | --- |
| Button | `.md-button`, `.secondary`, `.ghost`, `.danger`; use a native button for actions and a link for navigation. | Hover/focus/disabled/loading; keep a visible label and set aria-busy during real loading. Figma icon slot is optional and swappable. |
| Field | `.md-field`, `.md-input`, `.md-select`, `.md-textarea` with a visible label. | Default/focus/error/disabled/readonly. Associate help/error IDs using aria-describedby; use aria-invalid for errors. |
| Choice | `.md-check` wrapping a native checkbox; use role=switch only for an on/off preference. | Checked/unchecked, keyboard Space, visible label; the Figma Choice family contains both kinds. |
| Badge | `.md-badge` plus `.success`, `.warning`, `.error`. | Word and symbol communicate intent; Figma's generic label must be set for the product status. |
| Card | `.md-card` around a section/article with a heading. | Solid surface. Native links/buttons hold the actions; avoid a clickable container around other controls. |
| Alert | `.md-alert`. | Contextual information is visible text. Choose role=status/alert only when live announcements are appropriate. |
| Navigation item | Native anchor, current destination marked aria-current=page. | Persistent focus, clear current-state treatment. The sidebar provides the reference example. |
| Tab | `.md-tabs`, tablist/tab/tabpanel semantics. | Only the selected label is bold (700); other labels remain 500. Selected surface, roving tabindex, Left/Right/Home/End; see src/main.js. |
| Dialog | Native dialog, accessible title, showModal(). | Escape, focus containment/restoration; see index.html and src/main.js. |

## Button

```html
<button class="md-button" type="button">Continue</button>
<button class="md-button secondary" type="button">Save draft</button>
<button class="md-button danger" type="button">Delete item</button>
<button class="md-button" type="button" disabled aria-busy="true">Saving…</button>
<a class="md-button" href="/next-step">Next step</a>
```

Disabled and loading are separate behaviours even if their subdued appearance is related. Announce success only after an actual save is confirmed. Destructive labels must describe the real outcome; the reference opens a harmless example dialog.

## Field

```html
<label class="md-field">
  <span>Project name</span>
  <input class="md-input" required aria-describedby="name-help name-error">
  <span class="helper" id="name-help">Use a familiar name.</span>
  <span class="error" id="name-error" hidden>Enter a project name.</span>
</label>
```

On validation failure, show the error, set aria-invalid=true and focus the first invalid field. On correction, remove the invalid state. Do not erase the value. Unique IDs are required when composing multiple instances.

## Product integration

Use the recipes as the native contract when wrapping them in React, Vue or another framework. Preserve the semantic roles and keyboard behaviour. The Figma source map is documented in figma-library.json; a native Code Connect publication is not claimed on the current student plan.

## Profiles and list feedback

Set `data-meridian="grass"` or `"paper"` and `data-theme="light"` or `"dark"` on every independently themed boundary. Default button/surface/list contours use `radius/md` (24px); Paper fields use `radius/sm` (14px). Each `.md-list-row` owns its hover/press surface and uses the matching text role. Hover does not persist as selection. Press scales follow the profile tokens, and reduced motion removes spatial movement.

## Optional glass actions

Use `md-button glass` for protected peripheral chrome or `md-button opaque` for the solid alternative. Labels and boundaries use semantic text/control roles. A 96% tint and restrained blur keep the tested pairs readable. Native Figma glass additionally supports refraction. Keep editing cells, lessons, artwork and evidence surfaces opaque. Reduced transparency, increased contrast and forced colours switch immediately to a solid surface; keyboard activation remains native. Compare all seven states in the reference Components view.
