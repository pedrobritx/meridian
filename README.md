# Meridian

A human rhythm for software. Meridian is a humanist interface method: familiar materials, natural light, clear hierarchy and purposeful interaction. The Polaris Constitution remains its philosophical foundation; Meridian owns interface practice, Axis owns engineering capabilities and Sentinel owns security guidance. Each capability is independently usable; full Polaris governance is explicitly opt-in.

**Figma library 0.5 · Web reference 0.5** — [Live reference](https://britx.me/meridian/) · [Figma library](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian)

The reference includes seven views: Overview, Theme profiles, Foundations, Components, Symbols, Page patterns, and Product adaptations. Core, Grass, Paper, Parallel, Canvas and Gallery each provide light and dark appearances. Products can retain different palettes, typography and material choices through semantic remapping.

## Use the foundations

Load `styles/tokens.css` followed by `styles/components.css`. Use the native HTML recipes in [docs/components.md](docs/components.md). Components use semantic `--md-color-*` roles, not raw pigments. Product themes override those roles. `design/figma/generated/tokens.json` is the canonical twelve-mode token source; `styles/tokens.css` is generated and committed for direct adoption.

This is a reference library, not a published npm package or an automatic migration for existing products.

**Meridian 0.6 Living Matter stays experimental:** the [Forest-first Lab reference](lab/forest-reference/) explores Dawn/Dusk, independent ambient controls, accessible task semantics and illustrative notification contracts. Its [consolidated evaluation](research/decisions/2026-10-08-evaluation-12-consolidated.md) is a preference record, not a human study. Stable 0.5 tokens and consuming products are unchanged.

 The site uses semantic HTML, CSS and small JavaScript modules. Vite builds the static site; there is no framework runtime, backend, analytics or external font request. Profile and environment preferences are stored locally.

## Work locally

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The development and preview base is `/meridian/`, matching GitHub Pages. `npm run build` regenerates the plugin, CSS tokens and `dist/`. Edit the canonical JSON and `site/content.json` instead of generated outputs. Browser checks cover every view in all twelve profile/environment combinations at desktop and mobile widths, native dialog focus, tabs, local form validation, theme persistence and reduced motion.

## Universal 0.6 environment and component Lab

Meridian has six active environments: **Prism, Forest, Desert, Ocean, Aurora and Canyon**, each with Dawn and Dusk. Prism is the neutral starting point. Forest retains its green heritage; Desert now has a distinct gold foundation; Ocean consolidates Alpine, Storm and Glacier; Aurora incorporates Celestial; Canyon replaces Embers with a red sandstone direction. See the [philosophy](docs/philosophy.md) and [migration record](docs/migration/2026-11-03-six-environments.md).

The [Material Model](lab/material-model/), [Environment Patterns](lab/environment-patterns/) and [Universal Library](lab/universal-library/) are experimental review tools. Load `styles/living-environments.css` after `styles/tokens.css`, then opt in with `data-meridian-environment="prism"` (or another active environment) and `data-theme="light"` or `"dark"`. The manifest is the source for generated environment CSS. Retired selectors retain their archived palettes for compatibility.

## Design in Figma

The working Figma library has purpose-based component pages and six active Environment modes. All 468 canonical environment values and all 62 component locations were verified on 3 November 2026; see the [live evidence](design/figma/migrations/2026-11-03-live-verification.json). Website and Lab pages remain labelled inside the same file pending the separate-file migration.

Stable **Core, Grass, Paper, Parallel, Canvas and Gallery** profiles remain unchanged. These product profiles are a compatibility contract, distinct from the six environment families. Existing consumers are not automatically migrated to the new Desert or Aurora palettes. The original [Start / Review](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=7-2) remains a visual reference. Historical refactor maps and exports are dated snapshots, not a live inventory.

## Figma ↔ Meridian GitHub → website

Library changes belong in **pedrobritx/meridian**. Lexis is a product consumer of Paper, not the sync destination. [Activation and end-to-end verification](design/figma/README.md) cover:

- **Named versions:** the GitHub workflow checks every six hours, or immediately through the optional authenticated webhook, then opens/updates a draft PR and creates a handoff issue with layer diffs and review previews.
- **Shared contract:** the development plugin compares, imports or publishes tokens and mapped copy. Optional live mode checks every 30 seconds while open. GitHub imports preserve native aliases; conflicting edits pause synchronization.
- **Website:** merging a reviewed change into `main` runs build/accessibility checks and GitHub Pages deployment to [britx.me/meridian](https://britx.me/meridian/).
- **Review:** Figma publications create draft PRs; they never merge themselves. Layouts/prototypes are handoff artifacts, not a reversible compiler for application code. Closed plugins cannot receive GitHub changes on the current Figma plan.

GitHub Pages serves the static website. It cannot receive webhooks. Polling needs no additional host; optional immediate delivery uses `api/figma-webhook.mjs` on a Node-capable host such as Vercel.

## Product adaptations

[Adoption and provenance](docs/adoption.md) records repository-informed themes for Verbalis (CAT), NotUX (whiteboard), Lexis (ESL), Framio (online museum) and Ambientis (environmental compliance). Ambientis Grass/Terra remains a proposed mapping because its repository is a documented foundation. The shared library and reference implementation are maintained here; product application migrations require their own implementation changes.

## Validation and limits

See [docs/validation.md](docs/validation.md). Contrast assertions apply to tested solid surfaces; translucent compositions need context-specific checks. Automated accessibility passes are not a claim of full WCAG certification. Human screen-reader and native Safari/Firefox checks remain part of product adoption.

[Design decisions](docs/decisions.md) · [Contribution guide](CONTRIBUTING.md) · [Font and asset notices](THIRD_PARTY_NOTICES.md)

[Designer capability](agents/designer.md) · [Migration provenance](migration/provenance.json)

## Optional Constellation composition

Polaris is the usual coordinating entry point; [the composition contract](https://github.com/pedrobritx/polaris/blob/main/integration/README.md) defines explicit adoption, task scope and evidence returns. [discipline.json](discipline.json) describes this capability without installing a runtime dependency. Start directly at this repository’s AGENTS.md for standalone work.

When receiving a handoff, inspect the actual adopting project and retain its request ID, acceptance criteria, constraints and reviewed source revision. Return project artifacts, checks actually run, limitations, interface changes and blockers. Product-specific implementation/findings belong in the product repository; reusable capability improvements belong here. Excluded disciplines are explicit choices and never imply that their quality or safety checks passed.
