# Meridian current system

The active Figma file has six pages: Home, Develop, Foundations, Style, Components and Archive. The [current map](../design/meridian/figma-refactor-map.json) records their native IDs, active collections and functional glass sources. The 26-page organization from 9 October is retained under `previousOrganisation` as a historical record.

## Environments and compatibility

Current environments are Forest, Core, Desert, Ocean, Alpine, Storm, Celestial, Aurora, Glacier and Embers. Environment and appearance are independent: the native `Meridian / Environment` collection routes to `Meridian / Appearance`, which provides Dawn and Dusk. The web manifest resolves the twenty combinations into semantic CSS roles. Forest keeps the approved Grass colors and Desert keeps Paper; stable 0.5 profile selectors and its twelve-mode export remain compatibility contracts.

Load `styles/tokens.css`, `styles/living-environments.css`, your component styles, then `styles/liquid-glass.css`. Set `data-meridian="grass"`, `data-meridian-environment="aurora"` and `data-theme="light"` or `"dark"` on an independently themed boundary. The Universal Lab offers every current environment. Aurora's actions, selection and atmosphere use the same cool lavender/indigo semantics everywhere.

## Material rules

Glass belongs to controls, navigation and overlays. Reading, editing and data surfaces remain opaque. Each nearer material has a level at least one above its containing material, even when its usual role is lower. A floating surface overlapping another also rises above it. Frosting increases with level; selection adds a distinct lens without reducing frosting. Rounded geometry, soft directional highlights, contact shadows and broader floating shadows establish depth without hard rims.

`initLiquidGlass` enhances marked surfaces through native controls. Values, actions, labels and stable targets remain owned by the application. Menus are positioned within the visual viewport, can flip above their trigger and scroll when tall. Arrow keys navigate command menus; Tab dismisses them while preserving the next focus. Escape returns focus when the menu owns focus. Information popovers retain their separate focus behavior. Reduced motion disables spatial animation; opaque and forced-color fallbacks retain selection and visible control states.

## Component readiness

The catalogue contains 92 **component contracts**, not 92 certified implementations. Cards distinguish interactive examples from anatomy previews. Native grouped toolbar, action popover, sheet, switch, slider, dock and linked 64px XL sources are listed in the current map. Existing Button Style/State axes remain intact; XL is a linked option instead of duplicating that matrix. Toolbar and popover use the same Save action and native action symbols.

Figma depicts material and accessibility states. Background sampling, viewport placement, live overlap adaptation and native input handling belong to runtime code. Static Figma styling is not a substitute for those behaviors. Product-specific assistive-technology, browser, device and contextual translucent contrast review remain adoption gates.

The live native check also reconciles icon buttons, dialog/action groups, search/select/date controls, pagination, tooltips, toasts and functional control specimens. Controls nested above overlays use 48px frosting and stronger tint through the `front-control` and `front-selection` aliases. The current map records all reviewed sources, including the preserved opaque accessibility variants.

Archive is excluded from the active material redesign. Historical paints and inherited optics are protected as literal overrides before shared source changes. Stable publication, product migration and deployment are separate actions.
