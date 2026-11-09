# Components

Load the tokens, the components and the behaviour:

```html
<link rel="stylesheet" href="css/meridian.css">
<link rel="stylesheet" href="css/components.css">
<script type="module">
  import { enhance } from './src/material.js';
  enhance(document);
</script>
```

Without the script, every component except tabs, toolbar keys, sheet dragging and menu positioning still works and shows its state; the script adds the fluid behaviour: presses that sink and rebound, drops that travel, hover light. Call `enhance(root)` again after adding components to the page, and `refresh(root)` after changing a segmented control or switch from script without a `change` event.

The material layers (`.m-body` with `.m-refract` and `.m-light`) are added by the script when they are missing. Include them in the markup if the page must look complete before the script runs:

```html
<span class="m-body" aria-hidden="true"><span class="m-refract"></span><span class="m-light"></span></span>
```

Every component meets the target size for its context (`--target`: 40 px on Desk, 48 px on Touch and on any coarse pointer), shows a focus ring, works with the keyboard, holds still with reduced motion, and keeps its edges and states in forced-colours mode.

## Button

Pigment for the one primary action in a view, glass for the rest, quiet inside toolbars.

```html
<button class="m-mat m-pigment" type="button"><span class="m-label">Continue</span></button>
<button class="m-mat m-glass" type="button"><span class="m-label">Save draft</span></button>
<button class="m-mat m-quiet" type="button"><span class="m-label">Cancel</span></button>
```

- Toggle: add `aria-pressed="false"` and flip it on click. The pressed state fills with the accent.
- Busy: set `aria-busy="true"` while work runs and change the label ("Saving…"). A band of light flows through, and stays still with reduced motion.
- Disabled: `disabled`. The fluid sets: flat, matte and rigid.
- In Prism, a primary button carries a thin iridescent rim. No other component does.

## Icon button

A round drop for one action. It always needs an accessible name.

```html
<button class="m-mat m-glass m-icon" type="button" aria-label="Share">
  <span class="m-label"><svg viewBox="0 0 24 24" aria-hidden="true">…</svg></span>
</button>
```

Use `m-quiet` in toolbars and `m-pigment` for a primary action such as Play. Icons are 20 px, drawn on a 24 px grid with a 1.9 px stroke.

## Segmented control

Two to five choices that change a view. Built on radio buttons, so arrow keys, form submission and screen readers work as they do for any radio group.

```html
<fieldset class="m-seg">
  <legend>Measure</legend>
  <label class="m-seg-opt"><input type="radio" name="measure" value="narrow"><span>Narrow</span></label>
  <label class="m-seg-opt"><input type="radio" name="measure" value="comfort" checked><span>Comfort</span></label>
  <label class="m-seg-opt"><input type="radio" name="measure" value="wide"><span>Wide</span></label>
</fieldset>
```

The legend is hidden visually and read by screen readers; use `aria-labelledby` on the fieldset instead when a visible label sits outside it. A disabled option takes `disabled` on its input.

## Switch

An immediate on or off, for settings that apply at once. For a choice confirmed later with a Save button, use a checkbox.

```html
<label class="m-switch">
  <span>Quiet chrome while reading</span>
  <input type="checkbox" role="switch">
  <span class="m-switch-track" aria-hidden="true"><span class="m-mat m-thumb"></span></span>
</label>
```

The whole row is the target. `checked` and `disabled` work as on any checkbox.

## Slider

A value along a range, built on `<input type="range">`, so arrow keys, Page Up and Page Down, Home and End work as usual.

```html
<div class="m-field">
  <label for="text-size">Text size</label>
  <div class="m-slider" style="--m-value: .4">
    <input type="range" id="text-size" min="14" max="24" value="18">
    <span class="m-rail"></span><span class="m-fill"></span><span class="m-mat m-thumb" aria-hidden="true"></span>
  </div>
</div>
```

`--m-value` is the starting position from 0 to 1, so the slider is drawn correctly before the script runs; the script keeps it in step with the value. Show the value next to the label with an `<output>` when it matters.

## Text field

A quiet well on the content plane. Use `<textarea>` inside the well for longer text.

```html
<div class="m-field">
  <label for="note-title">Note title</label>
  <span class="m-mat m-well"><input id="note-title" type="text" aria-describedby="note-title-msg"></span>
  <p class="m-field-msg" id="note-title-msg" hidden><svg aria-hidden="true">…</svg><span>Give the note a title before saving.</span></p>
</div>
```

- Error: set `aria-invalid="true"` on the input and show the message. The rim turns to the error colour and the field jiggles once. The message always carries an icon and text that says what to do; never colour alone.
- Hint: `<p class="m-field-hint">`, linked with `aria-describedby`.
- Placeholders are not labels: always use a `<label>`.

## Checkbox and radio

For choices confirmed later with a Save button. For a setting that applies at once, use a switch.

```html
<fieldset class="m-choices">
  <legend>Reading aids</legend>
  <label class="m-check"><input type="checkbox" checked><span>Show line numbers</span></label>
  <label class="m-check"><input type="checkbox"><span>Highlight the current sentence</span></label>
</fieldset>

<fieldset class="m-choices">
  <legend>Paragraph spacing</legend>
  <label class="m-check"><input type="radio" name="spacing" value="tight"><span>Tight</span></label>
  <label class="m-check"><input type="radio" name="spacing" value="normal" checked><span>Normal</span></label>
</fieldset>
```

The whole row is the target. `indeterminate` (set from script) shows a dash. No script is needed.

## Tabs

Switch between panels of one view. For a setting that changes how one view looks, use a segmented control.

```html
<div class="m-tabs">
  <div class="m-tablist" role="tablist" aria-label="Field notes">
    <button class="m-tab" role="tab" id="tab-read" aria-controls="panel-read" aria-selected="true">Read</button>
    <button class="m-tab" role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false">Notes</button>
  </div>
  <div class="m-tabpanel" role="tabpanel" id="panel-read" aria-labelledby="tab-read" tabindex="0">…</div>
  <div class="m-tabpanel" role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" tabindex="0" hidden>…</div>
</div>
```

Tabs need the script: it moves between tabs with the arrow keys, Home and End, keeps only the chosen tab in the Tab order, shows its panel, and sends a `tabchange` event.

## Toolbar

A floating bar of quiet controls. It is one stop for the Tab key; arrow keys, Home and End move inside it.

```html
<div class="m-mat m-glass m-surface m-toolbar" role="toolbar" aria-label="Article">
  <button class="m-mat m-quiet m-icon" type="button" aria-label="Back">…</button>
  <span class="m-toolbar-title">Why shallow water glows</span>
  <button class="m-mat m-quiet m-icon" type="button" aria-label="Share">…</button>
</div>
```

Add `aria-orientation="vertical"` for a vertical toolbar; the arrow keys follow. A thin divider is `<span class="m-toolbar-sep" aria-hidden="true"></span>`.

## Dialog

A decision that needs an answer before anything else. Built on `<dialog>`: focus moves in and stays in, Escape closes it, and focus returns to the button that opened it.

```html
<button class="m-mat m-glass" type="button" data-m-open="delete-dialog"><span class="m-label">Delete note…</span></button>

<dialog class="m-dialog" id="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-desc">
  <h2 id="delete-title">Delete this note?</h2>
  <p id="delete-desc">The note and its highlights are removed from this device. This cannot be undone.</p>
  <form method="dialog" class="m-actions">
    <button class="m-mat m-quiet" value="cancel" autofocus><span class="m-label">Keep note</span></button>
    <button class="m-mat m-pigment" value="delete"><span class="m-label">Delete</span></button>
  </form>
</dialog>
```

The answer is in `dialog.returnValue` when its `close` event fires. Put `autofocus` on the safer choice. A click outside does not close a dialog: the decision waits.

## Sheet

Supporting content that rises from the bottom edge, such as options for the current view. Also a `<dialog>`; a click on the backdrop, the grabber, Escape or a drag down closes it.

```html
<dialog class="m-sheet" id="reading-sheet" aria-labelledby="sheet-title">
  <button class="m-sheet-grabber" type="button" aria-label="Close reading options"></button>
  <div class="m-sheet-head">
    <h2 id="sheet-title">Reading options</h2>
    <form method="dialog"><button class="m-mat m-quiet m-icon" aria-label="Close">…</button></form>
  </div>
  …
</dialog>
```

Open it with any `[data-m-open="reading-sheet"]` button. Call `refresh(sheet)` when it opens if it holds a segmented control or switch whose size was unknown while it was closed.

## Menu

A short list of actions next to its button, built on the `popover` attribute: a click outside or Escape closes it, and focus returns to the button.

```html
<button class="m-mat m-glass" type="button" popovertarget="sort-menu"><span class="m-label">Sort by</span></button>
<div class="m-menu" id="sort-menu" popover role="menu" aria-label="Sort by">
  <button class="m-menuitem" role="menuitem" type="button" value="newest">Newest first</button>
  <button class="m-menuitem" role="menuitem" type="button" value="title">Title</button>
  <hr class="m-menu-sep">
  <button class="m-menuitem is-danger" role="menuitem" type="button" value="delete">Delete…</button>
</div>
```

The script positions the menu under its button (or above, near the bottom edge), sets `aria-expanded`, moves focus with the arrow keys, Home, End and the first letter of an item, and sends a `menuselect` event with the chosen item. Use a menu for actions; to choose a value, use a segmented control or radio buttons.

## Behaviour in script

`src/material.js` exports:

- `enhance(root)`: wires every component inside `root`.
- `refresh(root)`: places segmented indicators, switch thumbs, slider thumbs and tab indicators after a change made in script.
- `jiggle(element)`: one short jiggle, for an error that appears on a control.
- `reducedMotion()`: `data-motion="reduced"` or `"full"` on the root, otherwise the system setting.
- `feelOf(element)`: the physical feel of the environment the element sits in.
