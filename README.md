# Meridian

A human rhythm for software. Meridian is a humanist interface method: familiar materials, natural light, clear hierarchy and purposeful interaction. BSDL remains its philosophical foundation; Meridian is the interface method, and BSF concerns the software-building process.

**Figma library 0.5 · Web reference 0.5** — [Live reference](https://britx.me/meridian/) · [Figma library](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian)

The reference includes seven views: Overview, Theme profiles, Foundations, Components, Symbols, Page patterns, and Product adaptations. Core, Grass, Paper, Parallel, Canvas and Gallery each provide light and dark appearances. Products can retain different palettes, typography and material choices through semantic remapping.

## Use the foundations

Load `styles/tokens.css` followed by `styles/components.css`. Use the native HTML recipes in [docs/components.md](docs/components.md). Components use semantic `--md-color-*` roles, not raw pigments. Product themes override those roles. `design/figma/generated/tokens.json` is the canonical twelve-mode token source; `styles/tokens.css` is generated and committed for direct adoption.

This is a reference library, not a published npm package or an automatic migration for existing products. The site uses semantic HTML, CSS and small JavaScript modules. Vite builds the static site; there is no framework runtime, backend, analytics or external font request. Profile and environment preferences are stored locally.

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

## Design in Figma

The native library contains **Core + Grass + Paper + Parallel + Canvas + Gallery**, with twelve resolved colour modes, profile-specific layout/motion/typography and 168 semantic roles per appearance. Core is neutral, Grass is green and Paper is sand/wine. The [profile guide](design/meridian/profiles.md), [project-purpose mapping](docs/adoption.md), [native inventory](docs/figma-library.json) and [token export](design/figma/generated/tokens.json) record the same contract. Ten editable Figma text layers share `site/content.json` with the website. Historical 0.1 source files remain archived.

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
