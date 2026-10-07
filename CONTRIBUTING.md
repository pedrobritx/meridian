# Contributing

Keep Meridian a method with product-specific identities. Read the README, docs/decisions.md, docs/adoption.md, token source and affected component recipes before making changes.

1. Describe the human task and the purpose of the proposed visual/interaction change.
2. Change the smallest relevant primitive, semantic role or component. Do not silently restyle a product.
3. Keep semantic parity in Grass/Paper light and dark. Bind Figma properties to variables and retain native browser semantics in code.
4. Run `npm test`, `npm run build` and relevant browser tests. Token changes require the full contrast checks; interaction changes require keyboard checks. Review responsive layouts and affected Figma frames visually.
5. Update the source map, recipe and changelog if the public contract changes. Publish Figma updates only after verification.

Do not commit personal data, credentials, dist/, node_modules/, local traces or unrelated product changes. The current source is provided without a general redistribution licence; confirm a licence before distributing it outside the intended projects.

The website and plugin share `design/figma/generated/tokens.json` and `site/content.json`. Run `npm run build` after editing these sources and commit regenerated CSS/plugin bundles. Never advance `content-baseline.json` for a GitHub-only text edit. GitHub imports keep aliases; roles that share one primitive must receive a coherent value. See [two-way synchronization](design/figma/README.md).
