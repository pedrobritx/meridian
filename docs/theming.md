# Build a product theme with Meridian

From 1.0, Meridian ships environments, not product brands (ADR-0002 §6). A product such as Lexis, Verbalis, NotUX or Framio keeps its own theme in its own repository and builds it with the method below, so it stays compatible with every Meridian component.

**Status:** the method is DECIDED. The helper named in step 4 is PROPOSED.

## 1. Start from an environment

Pick the Meridian environment closest to the product, for example Forest, Core, Desert or Ocean. Your theme overrides only the roles it needs; the rest come from that environment.

## 2. Fill the same 39 roles, in Dawn and Dusk

A theme defines the same role set as `design/meridian/living-environments.json`, as hex values (`#RRGGBB` or `#RRGGBBAA`) for both appearances.

| Group | Roles |
| --- | --- |
| `color/action/` | primary, secondary, hover, active, on-primary, destructive, on-destructive |
| `color/bg/` | page, surface, sunken, overlay, disabled |
| `color/text/` | primary, secondary, muted, disabled |
| `color/link/` | default, hover, visited |
| `color/border/` | control, subtle |
| `color/focus/` | ring |
| `color/status/` | success, warning, error, info, each with a `-bg` partner |
| `color/button/` | glass, glass-hover |
| `color/material/` | glass, edge |
| `color/elevation/` | shadow |
| `ambient/` (decorative) | atmosphere, highlight, glow, earth |

Keep `color/button/glass` at least 96% opaque: protective tint is part of Meridian's glass rule (`design/meridian/profiles.md`).

## 3. Pass the same contrast check as Meridian

Run every appearance through `environmentContrastPairs(roles)` from `src/universal/environment-tokens.mjs`. It checks 72 pairs per appearance:

- text, links and controls on every opaque surface;
- status colours on their backgrounds;
- action labels;
- button glass composited over each surface and over black and white.

A theme ships only when every pair passes, in both Dawn and Dusk. This is the same rule that decides whether a Meridian environment counts as a candidate or stays Preview.

## 4. Emit CSS under your own attribute

Each role becomes a custom property: `color/bg/page` becomes `--md-color-bg-page`, and `ambient/glow` becomes `--md-env-glow`. Scope the properties to your product's attribute, for both appearances:

```css
[data-meridian][data-product-theme="lexis"]:not([data-theme="dark"]) { --md-color-bg-page: …; }
[data-meridian][data-product-theme="lexis"][data-theme="dark"] { --md-color-bg-page: …; }
```

Meridian components read only `--md-*` properties, so they adopt the theme without changes.

- **Today:** `environmentCss` only accepts Meridian's six active environments, so products write the CSS themselves using `hexToCss`.
- **PROPOSED:** a product-facing helper that validates any 39-role palette and emits scoped CSS.

## 5. Keep the theme in the product

The theme file, its contrast evidence and any product typography belong to the product's repository. Meridian keeps only the method, the roles and the checks.
