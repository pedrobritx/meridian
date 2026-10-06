# Product adaptations and provenance

Inspected live repository files on 6 October 2026. These references document compatibility; they do not authorise changing the products.

| Product | Current evidence | Adoption boundary |
| --- | --- | --- |
| Lexis | [docs/design.md](https://github.com/pedrobritx/lexis/blob/main/docs/design.md), [globals.css](https://github.com/pedrobritx/lexis/blob/main/apps/web/src/app/globals.css): editorial paper/wine/gold, Fraunces/Newsreader/JetBrains Mono; day/night semantic roles and HSL/Tailwind integration. | Map roles deliberately. Preserve the relationship between the lesson artefact and the app; retain whiteboard content colours. |
| EFL Lesson Framework | [tokens.css](https://github.com/pedrobritx/efl-lesson-framework/blob/main/src/styles/tokens.css): paper/wine/gold, fluid spacing/type and a dedicated print stylesheet. | Preserve lesson and print identity. Investigate focus contrast in its own context before migration; do not copy decorative gold into text/focus roles by assumption. |
| VIA | [globals.css](https://github.com/pedrobritx/via/blob/main/src/app/globals.css): warm editorial system with deep green; explicitly light only, with documented contrast restrictions. | Preserve that product decision and its index colours. Never call a proposed Dusk mapping an existing feature. |
| Ambientis | [docs/product/ux.md](https://github.com/pedrobritx/ambientis/blob/main/docs/product/ux.md): Meridian Terra, mobile-first journeys, exact tokens unavailable/pending. | Define Terra separately with provenance. This reference does not approve or invent its production palette. |

Load the shared semantic API, then map product roles under a product selector. Verify the text-on-action pair together. Product constraints may limit the available environments; the reference's two modes are not a licence to silently add a new mode.

Use one page to validate keyboard use, mobile hierarchy, reading comfort, loading/error/empty states and rendering in the product's supported browsers. Keep localisation and user-facing status language separate from business rules. Expand only after the page works in context.
