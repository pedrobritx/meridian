# Meridian Liquid Glass revamp — implementation and maintenance

The website changes and this native Figma handoff increase translucency while preserving rounded optical highlights, contact shadows, broader elevation shadows and selected-item separation. Glass belongs to the functional layer above the content: navigation, toolbar action groups, buttons, interactive knobs, menus, sheets and popovers. Content, artwork and documentation wrappers retain their own material.

**Current status: implemented in the web reference and active Figma library.** Native component sources, environment review examples and semantic Aurora roles were updated directly. Grouped toolbar `510:2238`, action popover `510:2279` and linked XL option `510:2280` are live. See [the current system guide](current-system.md) for adoption and [the current map](../design/meridian/figma-refactor-map.json) for source IDs. The function below remains an optional, dry-run maintenance handoff; importing it performs no operation. No named version or deployment is claimed.

## Optional native maintenance patch

[`design/figma/liquid-glass-revamp.js`](../design/figma/liquid-glass-revamp.js) exports `revampLiquidGlass(figma, { apply: false })`. It is restricted to the Meridian file key and requires the native plugin API's `loadAllPagesAsync`. Use it through a native plugin bundle; it is not a browser script, a REST canvas writer or a token-bridge update.

The default dry-run discovers existing collections, material roles, functional surfaces and a canonical Primary/Default Button source by name/type. Inspect its report before calling with `apply: true` in an authorized Figma editing session. Missing Environment roles, unresolved native paint colors or an unavailable Archive snapshot stop the operation before writes. Fonts are loaded before mutations; if native nodes or token values change during preparation, the operation stops without overwriting those edits. The script does not invent canvas IDs, rename existing collections, flatten Environment aliases, reshape existing masters or rewire prototypes.

Existing direct RGBA values named `color/material/layer/{tier}` or `{environment}/color/material/layer/{tier}` receive the following alpha values; their existing RGB channels remain unchanged. Environment → Appearance aliases stay intact. Aurora selection specifically reuses Aurora's existing cool `color/bg/sunken` RGB rather than the action/status green.

| Functional tier | Dawn alpha | Dusk alpha | Base frost radius |
| --- | ---: | ---: | ---: |
| Rear material | 0.32 | 0.42 | 16 |
| Navigation | 0.40 | 0.49 | 24 |
| Raised control | 0.48 | 0.56 | 32 |
| Menu, sheet, popover | 0.56 | 0.63 | 40 |
| Selected lens | 0.56 | 0.64 | 32 |
| Control above an overlay | 0.64 | 0.70 | 48 |
| Selected lens above an overlay | 0.72 | 0.78 | 48 |

These are Meridian reference values. Each material nested above another advances frosting by at least 8px beyond its ancestor. Runtime also advances tint by level; selection adds 8 percentage points while retaining frost. Native compositions share glass within action groups and menus rather than giving every unselected item a separate embossed rim. Existing stronger native frost is retained by the optional maintenance function.

The live Figma reconciliation also updates icon buttons, action groups, dialog surfaces, search/select/date controls, pagination, tooltips, toasts and the functional split-button/numeric-stepper/date-range/token-field specimens. Foreground controls use native Environment aliases `color/material/layer/front-control` and `front-selection`, routed through Appearance and private primitives for all twenty environment/appearance combinations. The legacy Material collection's reference frost/tint values now agree with the current scale. Pagination shares a navigation plane, with a selected lens on the current page and clear siblings. Existing source IDs and content remain in place.

Native GLASS supplies the optical layer with restrained refraction, zero dispersion, a rounded highlight and the appropriate frosting radius. Existing shadows remain; missing contact and elevation shadows and an inner highlight are added. Existing control corners become rounder without resizing, moving or reparenting existing nodes. Focus rings preserve their width and bindings. Opaque, disabled, loading, error, high-contrast and reduced-transparency variants remain intact.

Action and selected labels use semantic primary text on pale or sunken material. Selection pigment comes from the environment's sunken role, including cool Aurora. The existing material selection foreground routes to primary text in every current environment. Status and destructive-action semantics remain distinct. Contextual contrast over arbitrary artwork remains an adoption check; the Universal Lab's twenty environment/appearance compositions have separate rendered accessibility coverage.

## Navigation, grouping and XL controls

Keep optical overflow separate from content masking. Transparent navigation/action rows, toolbar groups and component-set preview bounds must allow the full shadow and focus outline to render. Clip atmosphere, artwork and genuine scrolling content in their own bounded surfaces. Reserve insets for an effect's blur radius, spread and offset whenever a containing window must clip. A transparent wrapper around an existing glass plane should carry no duplicate glass/shadow treatment. The native follow-up checks visible shadow extents against every clipping ancestor, rather than checking effects only on their owning nodes.

Recognized Header, Sidebar, Navdock and other family variants inherit their family's material role even when a variant's own name is `State=Default`. A `Specimen / Menu` child is the functional surface; its documentation wrapper remains content. A parent property such as `Selected=Overview` highlights the matching segment, without selecting its siblings.

Existing named toolbar `Group` / `Cluster` containers receive a shared navigation material. Their parent's duplicate chrome is cleared, leaving the actual action groups floating independently. Existing action positions, labels and group hierarchy are retained. Toolbars without named groups receive a material update and remain flagged for visual grouping review; the script does not infer unrelated actions and silently reparent them. Common menu actions should use the existing semantic icon library, and contextual-menu priority should agree with corresponding swipe actions where provided.

When no XL option exists, the patch can create one standalone `Button / Liquid XL` component on the discovered Actions/Core master page or the current `Components` page, containing an instance of the existing canonical Primary/Default Button. Its minimum height is 64px, horizontal padding is 24px and its outline is a capsule. Existing variant axes, icon source, label properties and prototype destinations stay with the linked button. It is created only once, away from existing page content. If the canonical source or required native methods are unavailable, the report identifies the missing XL option instead of guessing a source. The wrapper remains a design option requiring size/state review; its existence does not certify every native button size or interaction state.

## Archive preservation and recovery

Before any shared token or active source-master mutation, the patch captures Archive nodes' native paints, resolved colors, effects, strokes, radii, geometry and prototype data. It pins resolved archival paints as literal overrides before changing material token cells. This intentional Archive exception prevents a historical instance from inheriting newly translucent token values.

After active changes, the patch restores any optical properties that Archive instances inherited from modified masters and compares their resolved source appearance, geometry and prototype data against the captured snapshot. Archive content receives no new component or style treatment. If preservation cannot be demonstrated, the operation rolls back changed token cells and node properties and reports any rollback failure explicitly. A successful result returns all created/mutated node IDs and modified variable IDs, including necessary Archive preservation overrides. Source bindings remain semantic in active Meridian; historical overrides prioritize exact archived appearance.

The snapshot/rollback mechanism is an in-session safeguard. Apply from a recoverable Figma version in a controlled editing session and retain the result report for review. No named version has been created by the prepared patch.

## Validation evidence and remaining native review

The focused tests execute this actual handoff function against a small native API fake with shared-master inheritance and resolved COLOR alpha. They cover dry-run immutability, translucency with retained depth, cool Aurora, readable foreground bindings, Archive fidelity, rollback, idempotence, XL linkage, family-role discovery, sibling selection and toolbar grouping without geometry changes.

```sh
node --test scripts/figma/liquid-glass-revamp.test.mjs
```

The tests validate this optional maintenance function against a native API fake. Actual Figma updates were performed and visually inspected separately. Browser regressions now exercise real reference pages and their production CSS, including viewport placement, selected lenses, monotonic nested frosting and forced-color control states. Native Apple framework behavior and arbitrary-image contrast still require product-specific adoption checks.

Static Figma effects and existing state variants can depict frosted knobs, focused controls, expanded menus and navigation hierarchy. Real-time overlap/focus adaptation, background sampling, hardware-dependent curvature, scrolling edge treatment and fluid button-to-menu morphs require runtime implementation or deliberate prototype transitions. This patch preserves existing prototype actions and makes no claim that those native system behaviors have been implemented.

## Design references

The user supplied Apple's Liquid Glass guidance and the [Toolbars HIG](https://developer.apple.com/design/human-interface-guidelines/toolbars). Related references are [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [Menus](https://developer.apple.com/design/human-interface-guidelines/menus). The user-supplied excerpt informed the functional-layer hierarchy. The implementation does not claim to reproduce Apple's private rendering parameters.
