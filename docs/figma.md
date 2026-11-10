# Figma library

The Meridian 1.0 library is the Figma file [Meridian 1.0 Library](https://www.figma.com/design/U0pTiFWeDqXaiyO0t35n5o) (file key `U0pTiFWeDqXaiyO0t35n5o`) in the Projects team. It holds the static design of the twelve web components. Motion, refraction and the fluid response are reviewed in the Material Lab. The library is not published yet.

The 0.5 library file is kept as it was, and moves to the lab and archive file later.

## Variables

| Collection | Modes | Holds |
| --- | --- | --- |
| Appearance | Dawn, Dusk | The public colour API: `color/*`, each an alias of the active Environment's Dawn or Dusk value. |
| Environment | Prism, Forest, Desert, Ocean, Aurora, Canyon | Hidden `dawn/*` and `dusk/*` values from `tokens/meridian.tokens.json`, plus `material/frost` and `material/refract`. |
| Context | Desk, Touch | `target` (40, 48) and `gap` (12, 16). |
| Scale | Value | `space/s1`–`s8`, `radius/*` and the `font/*` families. |

To preview a component in another environment, set the Environment and Appearance modes on the frame that holds it.

Every `color/*` variable carries its CSS as WEB code syntax. A few colours that the CSS mixes at run time are stored as variables, with the `color-mix()` expression as their code syntax:

- `color/tint/ink`
- `color/tint/accent`
- `color/disabled`
- `color/indicator`
- `color/well`
- `color/track`
- `color/rail`
- `color/glass/thick`

The 168 base colour and material values were checked against the token file after the variables were created, with no differences.

## Styles

- **Text styles:**
  - `UI/Title`, `UI/Body`, `UI/Body multiline`, `UI/Body small`;
  - `UI/Label`, `UI/Tab`, `UI/Option`, `UI/Option chosen`;
  - `UI/Caption strong`, `UI/Caption`, `Read/Body`.

  They take their sizes from `css/components.css` and the reference page, and their family from the `font/*` variables.
- **Effect styles:**
  - `Material/Rest`, `Material/Overlay`, `Material/Dialog` and `Material/Sheet` carry the shadows, the frost blur and the inner rim and sheen light;
  - `Material/Frost` carries the blur alone.

  Each colour and blur radius is bound to a variable.

## Differences from the web

These are the places where Figma cannot match the CSS exactly:

- **Reading serif:** Source Serif 4 stands in for the reading serif (`ui-serif`, New York on Apple platforms).
- **Shadow direction:** shadows follow the Prism light angle. The web shifts them with each environment's light.
- **Shadow strength:** the dialog and sheet shadows bind the 40 percent overlay shadow; the web uses 45 and 35 percent.
- **Prism primary button:** the iridescent rim of the Prism primary button is not drawn.
- **Hover and press:** hover, press, ripple and the drop's stretch are motion and are not drawn. The components show Rest, Focus, Disabled and, where they apply, Selected or Invalid.
- **Translucent colours:** a colour bound to a variable loses its paint opacity inside instances. Where a colour needs reduced strength, the layer carries the opacity instead:
  - icon fills at 14 percent;
  - the sheet grabber at 24 percent;
  - the slider rail edge at 60 percent;
  - the disabled field edge at 50 percent.
