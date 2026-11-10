# Decisions for Meridian 1.0

Decisions Pedro has made. Change them only with his agreement.

## Scope

- Meridian 1.0 restarts from the Material Lab.
- 1.0 is a stable core plus Preview. Automated checks decide what is stable; anything that fails ships as Preview.
- Web first: Desk and Touch are built. Wrist, Space, TV and Drive stay written specs in the token file.

## Colour and material

- Six environments, each with Dawn and Dusk: Prism (default), Forest, Desert, Ocean, Aurora and Canyon. Environment × appearance is the only public colour API.
- Fluid is a behaviour shared by the whole system, not a theme.
- Each product may override one thing: its accent.
- Prism's accent is graphite, with iridescence on the primary button only.
- Ground texture is on by default; reducing it is an accessibility option. Each environment's ground follows its own logic.
- Shapes are round at rest and behave like blobs only while they move. The look stays modern and calm, closer to visionOS and macOS than to decorative skeuomorphism.

## Physics

- How a press gives and recovers may vary by environment. What it does, the hit areas and the timing do not: every feel settles within 0.9 s.

## Type

- Platform-native UI type plus one reading serif.

## Figma, GitHub and the website

- Tokens, documentation and recipes are edited in GitHub and pushed to Figma. Components and specs are designed in Figma and come to GitHub as pull requests on named versions.
- When Figma and GitHub disagree, Figma's newer value wins if it passes the checks.
- Figma holds static design and is reviewed first; motion and refraction are reviewed in the lab.
- Three Figma files: library, website, and lab/archive. The 1.0 library is described in [figma.md](figma.md).
- The website lives at britx.studio/meridian, built with Vite and served by GitHub Pages. Its home is a "Get started" presentation; philosophy is written in the manner of Apple's Human Interface Guidelines and specifications in the manner of Material 3.
