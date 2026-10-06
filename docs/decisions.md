# Decisions — web reference 0.1

## Source hierarchy

The user selected Figma plus GitHub, web first, with existing product adaptations. The supplied Obsidian `Meridian Design System.md` defines the Dawn/Dusk palette and atmospheric intent. The local Meridian Constitution v1.0 and current Lexis docs/design.md establish the broader method: primitive → semantic → product; purposeful material references; product-specific identity. The colour research document is background, not verified scientific evidence or an instruction to implement health claims.

These compose as follows: Dawn/Dusk is the reference theme, not a universal palette. The original pigments are retained. Glass is optional chrome with opaque fallbacks; reading surfaces remain solid. Elevation uses tone and boundaries rather than mandatory transparency. VIA's existing light-only decision is recorded, not rewritten. No product repository is changed.

## Colour

The supplied text, action and status colours are not all safe on every surface. Accessible derivatives are explicit primitives: ink-muted #695E52 (Dawn muted text), tide-lit #90BED8 (Dusk action/info), warning-ink #854629, success-ink #465638, sea-green #98C3A4, amber-clay #E8B88A and garnet-lit #EDADB6. These are new reference choices, not previously approved product tokens. Token tests check text at 4.5:1 and focus/control boundaries at 3:1 on all solid reference surfaces.

## Typography and implementation

Fraunces display, Newsreader reading and JetBrains Mono labels reflect the inspected education/VIA implementations. A product can replace font roles. Fonts are self-hosted through Fontsource packages. The reference uses native HTML controls and the HTML dialog element, CSS token roles and lightweight JS. Vite is build/development tooling only. No backend or framework migration is introduced.

## Adaptation and versioning

0.1.0 is the first implemented reference, not a claim that every planned design-system capability is complete. Native Apple libraries, product migrations, a complete icon catalogue, advanced component families and approved Terra tokens remain future work. Designs and runtime representations share names and values but are not pixel-identical captures; Figma uses editable layers and instances.
