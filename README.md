# Meridian

A human rhythm for software. Meridian is a humanist interface method: familiar materials, natural light, clear hierarchy and purposeful interaction. BSDL remains its philosophical foundation; Meridian is the interface method, and BSF concerns the software-building process.

**Figma library 0.4 · Web reference 0.1** — [Live reference](https://britx.me/meridian/) · [Figma library](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian)

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

The native library is now **Meridian Core + Grass + Paper**, with four colour modes, profile-specific shape/motion modes, 165 semantic tokens per colour mode and a 24px default surface radius. The current [system handbook](design/meridian/README.md), [profile guide](design/meridian/profiles.md), [native inventory](docs/figma-library.json) and [resolved token export](design/figma/generated/tokens.json) record this contract. The 0.1 website and `tokens/meridian.json` remain a separate, older implementation; they do not import the 0.4 export automatically. Its original source map is archived in `docs/figma-library-0.1.json`.

## Figma → Meridian GitHub

Library changes belong in **pedrobritx/meridian**. Lexis is a product consumer of Paper, not the sync destination. [Activation and end-to-end verification](design/figma/README.md) cover:

- **Named versions:** the GitHub workflow checks every six hours, or immediately through the optional authenticated webhook, then opens/updates a draft PR and creates a handoff issue with layer diffs and review previews.
- **Native tokens:** the included development plugin explicitly publishes Grass/Paper light/dark tokens to this repository. It does not publish on each edit.
- **Review:** exports never merge themselves or generate application behaviour. Credentials and a real named-version delivery must be verified before calling the connection active.

GitHub Pages serves the static website. It cannot receive webhooks. Polling needs no additional host; optional immediate delivery uses `api/figma-webhook.mjs` on a Node-capable host such as Vercel.

## Product adaptations

[Adoption and provenance](docs/adoption.md) documents the existing Lexis, EFL Lesson Framework and VIA identities. Ambientis Terra remains a planned adaptation with exact tokens pending. None of those repositories is changed by this release.

## Validation and limits

See [docs/validation.md](docs/validation.md). Contrast assertions apply to tested solid surfaces; translucent compositions need context-specific checks. Automated accessibility passes are not a claim of full WCAG certification. Human screen-reader and native Safari/Firefox checks remain part of product adoption.

[Design decisions](docs/decisions.md) · [Contribution guide](CONTRIBUTING.md) · [Font and asset notices](THIRD_PARTY_NOTICES.md)
