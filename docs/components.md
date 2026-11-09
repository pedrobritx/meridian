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

Without the script, every component still works and shows its state; the script adds the fluid behaviour: presses that sink and rebound, drops that travel, hover light. Call `enhance(root)` again after adding components to the page, and `refresh(root)` after changing a segmented control or switch from script without a `change` event.

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

## Behaviour in script

`src/material.js` exports:

- `enhance(root)`: wires every component inside `root`.
- `refresh(root)`: places segmented indicators and switch thumbs after a change made in script.
- `jiggle(element)`: one short jiggle, for an error that appears on a control.
- `reducedMotion()`: `data-motion="reduced"` or `"full"` on the root, otherwise the system setting.
- `feelOf(element)`: the physical feel of the environment the element sits in.
