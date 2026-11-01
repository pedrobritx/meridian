# ADR-0002 — Meridian 1.0: one system, three Figma files, one website

- **Status:** Accepted by project owner, 2026-11-01 (four decisions below). Implementation not started.
- **Decision scope:** Meridian repository and the Meridian Figma file `aJ2f6aYX9KBucAdPsCmkXn`.
- **Baseline:** Meridian 0.5.0 (`main` at `d16ad61`), Figma state exported in `design/figma-export/` on 2026-11-01.
- **Related plan:** [Meridian 1.0: library and website](../roadmap/1.0-library-and-site.md).
- **Supersedes:** nothing. ADR-0001 (prototype first) still governs 0.6 Lab work.

## Context

Meridian is moving from a reference library with a demo site to a design system that works as a reusable Figma component library and as a public website that explains itself: its philosophy in the manner of Apple's Human Interface Guidelines, its design specifications in the manner of Material Design 3. The 2026-11-01 audit found the Figma file ahead of GitHub and repo links pointing at a page structure that no longer exists (see the plan).

## Decisions (DECIDED, project owner, 2026-11-01)

1. **Source of truth is split by layer.** Tokens, documentation copy and component recipes are edited in GitHub and pushed into Figma by the Meridian plugin. Components, visual specifications, symbols and page designs are designed in Figma and reach GitHub as pull requests from named versions.
2. **Three Figma files.** A published **library** file (foundations, variables, styles, symbols, components, templates), a **website** design file (the pages of the Meridian site, built from library instances), and a **lab and archive** file (0.6 experiments, superseded work, provenance).
3. **Web only for 1.0.** Apple and Android platform kits remain a later topic (the existing Develop / Mobile placeholder).
4. **The website stays on Vite and GitHub Pages.** Extend the existing build rather than migrate.

## Consequences

- Every change has one origin and one record: a GitHub commit or a Figma named version that produces a GitHub pull request. Neither side is edited silently from the other.
- Variable, mode, collection and component IDs referenced by stable 0.5 consumers must survive the file split. The current file becomes the library file so those IDs stay put. Content that leaves it is copied, and an old-to-new ID map is recorded in `migration/` before any original is removed.
- The website is generated from the same exported data as the library (variables, component inventory, screenshots, symbols), so the site cannot drift from Figma unnoticed.
- No canonical token, stable 0.5 selector or mode ID changes without its own approved change and a deprecation note.
