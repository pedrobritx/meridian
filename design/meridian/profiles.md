# Meridian Core, Grass and Paper — 0.4

Meridian is a family of familiar interfaces. **Core** is the shared behavioural and accessibility contract. **Grass** is its environmental-compliance expression; **Paper** is its learning and editorial expression for Lexis. Existing green library specimens belong to Grass. A profile changes meaningful material cues, not the meaning of an error or a disabled control.

| Attribute                              | Grass                                                   | Paper                                                           |
| -------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Context                                | Evidence, permits, stewardship, environmental assurance | Lessons, notebooks, annotations, learning and development       |
| Ground and accent                      | Pine, mint and soft natural grounds                     | Warm paper, wine ink and restrained gold                        |
| Default surface / list / button radius | 24px                                                    | 24px                                                            |
| Compact radius (`radius/sm`)           | 24px                                                    | 14px                                                            |
| Large radius                           | 32px                                                    | 24px                                                            |
| Reading                                | Clear operational text                                  | Newsreader reading passages; Fraunces display; Manrope controls |
| Settle curve                           | cubic-bezier(0.2, 0.8, 0.2, 1)                          | cubic-bezier(0.22, 1, 0.36, 1)                                  |
| Press scale                            | 0.98                                                    | 0.99                                                            |
| Hover / release / overlay              | 140 / 220 / 320ms                                       | 140 / 220 / 320ms                                               |

Circular controls, slider thumbs, compact selection marks and icons retain their necessary geometry. The 24px default is not a blanket replacement of every corner in the file. Preserve deliberate local design adjustments unless they conflict with the interaction or contrast contract.

## Apply a profile in Figma

Set modes on the outermost screen or section; descendants inherit them. Shared component definitions remain linked.

| Profile     | Colour collection | Layout collection | Motion collection |
| ----------- | ----------------- | ----------------- | ----------------- |
| Grass light | Dawn              | Grass             | Grass             |
| Grass dark  | Dusk              | Grass             | Grass             |
| Paper light | PaperDawn         | Paper             | Paper             |
| Paper dark  | PaperDusk         | Paper             | Paper             |

The original Dawn/Dusk mode IDs remain intact for compatibility. Typography and elevation roles are shared. Do not create duplicate component libraries to recolour a product. Apply the complete mode combination, not just Colour. Clear unintended child mode overrides when a section does not follow its parent.

- [Profile architecture](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=92-35)
- [Grass workspace](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=91-35)
- [Paper workspace](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=91-2693)
- [Paper interaction lab](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=91-2797)

## Interaction contract

**Segmented control:** selection is owned by the parent variant. Exactly one label is Bold and all other labels are Medium. Owned text layers replace nested tab font overrides that can persist across variant transitions. Change `Selected`; never manually bold a demo instance. Click paths exist between all three selections.

**Lists:** each linked `Meridian / List item` owns its hover and press feedback. The list container does not react as a whole. `radius/md` is 24px; labels use readable foreground/surface pairs. Hover and press are temporary; they do not silently select another row.

**Checkbox, radio and switch:** selection is independent of interaction state. Hover preserves selection. Checkbox/switch activation toggles selection; an already selected radio remains selected. Disabled and loading variants cannot activate. A complete radio-group keyboard implementation remains a code responsibility.

**Buttons:** primary/destructive fills pair with their on-colour foregrounds. Secondary/quiet actions pair action text with neutral surfaces. Disabled text remains readable; do not reduce opacity on an entire control. Secondary-looking instances use the Secondary component style instead of recoloured Primary instances.

**Flows:** return, recovery, empty-state creation and deletion confirmation now have destinations. Sample save/delete screens describe their prototype-only nature. These are designed journeys, not real persistence. Figma supports demonstrative state changes; browser focus management and screen-reader behaviour still require implementation testing.

## Token export and code adoption

The plugin exports 165 semantic tokens for each of `Dawn`, `Dusk`, `PaperDawn`, `PaperDusk`. Alias resolution selects the matching colour mode and the corresponding Grass/Paper layout and motion mode. Primitives remain internal. The generated reference CSS supports:

```html
<main data-meridian="grass" data-theme="light">…</main>
<main data-meridian="paper" data-theme="dark">…</main>
```

Always specify both attributes at each independently themed boundary. Legacy `:root` and unprofiled `.dark` remain Grass defaults. Profile attributes scope the generated `--meridian-*` variables; they do not automatically restyle the existing Lexis application. Lexis currently stores HSL channel tokens and has a 14px base radius. Adopting Paper's 24px default requires a reviewed product change; importing RGB reference variables directly into HSL-channel slots would be invalid.

Figma motion variables document the runtime contract. Its prototype transitions use explicit values and do not automatically inherit every timing/curve variable. Update and test prototype reactions alongside any motion change. Reduced motion removes spatial effects while preserving immediate state feedback.

## Add another Meridian

1. Define the product's users, main tasks, familiar objects and materials. Explain each metaphor's purpose.
2. Add complete light/dark colour aliases; keep semantic names stable and pair foregrounds with surfaces.
3. Add profile modes for shape and motion only where context justifies differences. Keep keyboard behaviour, clear errors and focus invariant.
4. Register mode names in the export plugin/config and add explicit CSS selectors. Unsupported profiles must fail validation rather than falling through to another theme.
5. Compose examples from shared instances. Test all states, contrast, temporary hover/press, independent selection and return paths.
6. Review the token snapshot and visual changes in a PR. Publish a versioned library update and record adoption decisions.

Target 4.5:1 for text and 3:1 for meaningful boundaries/focus. Check glass against actual composited backgrounds. Profile customization never exempts a state from legibility.
