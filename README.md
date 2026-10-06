# Meridian

A human rhythm for software. Meridian is a humanist interface method: familiar materials, natural light, clear hierarchy and purposeful interaction. BSDL remains its philosophical foundation; Meridian is the interface method, and BSF concerns the software-building process.

**Web reference 0.1** — [Live reference](https://pedrobritx.github.io/meridian/) · [Figma library](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian)

The reference includes six views: Overview, Foundations, Components, Symbols, Page patterns, and Product adaptations. Dawn and Dusk are a paired reference theme. Products can retain different palettes, typography and material choices through semantic remapping.

## Use the foundations

Load `styles/tokens.css` followed by `styles/components.css`. Use the native HTML recipes in [docs/components.md](docs/components.md). Components use semantic `--md-color-*` roles, not raw pigments. Product themes override those roles. `tokens/meridian.json` is the versioned token source; `styles/tokens.css` is generated and committed for direct adoption.

This is a reference library, not a published npm package or an automatic migration for existing products. The site uses semantic HTML, CSS and small JavaScript modules. Vite builds the static site; there is no framework runtime, backend, analytics or external font request. Only the environment preference is stored locally.

## Work locally

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The development and preview base is `/meridian/`, matching GitHub Pages. `npm run build` regenerates CSS tokens and produces `dist/`. Edit the JSON source instead of generated CSS. Browser checks cover every view in Dawn and Dusk at desktop and mobile widths, native dialog focus, tabs, local form validation, theme persistence and reduced motion.

## Design in Figma

The file contains six pages, four named variable collections, eight text styles, three glass styles, twelve vector symbol components and nine core component families. Use component instances, select Dawn/Dusk through the Colour collection, and edit properties rather than detaching instances. [Library inventory and source mapping](docs/figma-library.json).

Figma is the editable design representation; GitHub stores implementation, versioned tokens and acceptance evidence. Synchronisation is explicit: token changes require updating Figma values/bindings and running the checks, then publishing the library update. This release does not install a background synchroniser. Code Connect availability depends on the Figma plan; the source mapping is kept in the repository regardless.

## Product adaptations

[Adoption and provenance](docs/adoption.md) documents the existing Lexis, EFL Lesson Framework and VIA identities. Ambientis Terra remains a planned adaptation with exact tokens pending. None of those repositories is changed by this release.

## Validation and limits

See [docs/validation.md](docs/validation.md). Contrast assertions apply to tested solid surfaces; translucent compositions need context-specific checks. Automated accessibility passes are not a claim of full WCAG certification. Human screen-reader and native Safari/Firefox checks remain part of product adoption.

[Design decisions](docs/decisions.md) · [Contribution guide](CONTRIBUTING.md) · [Font and asset notices](THIRD_PARTY_NOTICES.md)
