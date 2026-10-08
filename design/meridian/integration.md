# Figma ↔ GitHub token connection

The canonical target is **pedrobritx/meridian**. Figma file `aJ2f6aYX9KBucAdPsCmkXn` is the editable design source. The workflow, plugin and optional receiver in this repository all target Meridian. Lexis is a consumer of the Paper profile, not the destination for library updates. Live delivery requires the activation steps below; the checked-in snapshot is not evidence that the webhook is active.

## Source and flow

1. Figma native primitives/semantic aliases are the reference library decisions. Code syntax points to `--meridian-*`.
2. The included development plugin resolves all six profiles in light/dark appearances and sends a deliberately published token bundle to GitHub. On Education plans this avoids the Enterprise Variables REST API.
3. The workflow validates names/types/units/theme parity, generates reference JSON/CSS and opens or updates a draft PR. Named versions separately export layer diffs and review previews, with a handoff issue.
4. Designers and developers review semantic changes together. Product implementation maps those roles to its approved theme; merge does not silently recolour the app.

The current export also includes typography family/weight, easing, duration, grid, elevation and layering values. `figma-source.json` preserves native IDs, aliases, scopes and styles as audit provenance. CSS is a generated reference artifact; do not edit it by hand.

## Lexis semantic mapping

| Meridian reference role | Existing Lexis contract | Product decision                           |
| ----------------------- | ----------------------- | ------------------------------------------ |
| color/bg/page           | --background            | Paper by day; warm night ground            |
| color/bg/sunken         | --surface-sunken        | Input well                                 |
| color/bg/surface        | --card                  | Raised reading/card surface                |
| color/bg/overlay        | --popover               | Highest temporary surface                  |
| color/text/primary      | --foreground            | Product ink/paper                          |
| color/text/muted        | --muted-foreground      | Validate small-text contrast               |
| color/action/primary    | --primary               | Wine, not the reference pine/mint          |
| color/action/on-primary | --primary-foreground    | Product contrast pair                      |
| color/action/hover      | --primary-strong        | Stronger product accent                    |
| color/status/error      | --destructive           | Existing answer/error semantics            |
| color/status/error-bg   | --destructive-muted     | Existing error surface                     |
| color/status/success    | --success               | Existing learning/answer semantics         |
| color/status/success-bg | --success-muted         | Existing success surface                   |
| color/border/control    | --input                 | Verify ≥3:1 where boundary conveys control |
| color/focus/ring        | --ring                  | Product wine focus                         |
| motion/duration/hover   | --duration-fast         | 140ms                                      |
| motion/duration/release | --duration-base         | 220ms                                      |
| motion/duration/overlay | --duration-slow         | 320ms                                      |

Lexis stores colours as HSL channel triplets for Tailwind alpha composition. Meridian reference CSS uses complete rgb() colours. Never assign an rgb() string directly to a Lexis HSL-channel variable. Paper now records Lexis's palette and settle curve as a named profile. Its 24px default surface/list radius is a design update; the existing application still has a 14px base radius. Product adoption remains a separate reviewed implementation change.

## Activation and verification

Follow [the bridge activation guide](../figma/README.md#activate). GitHub needs the Figma secret and permission for Actions to create PRs; immediate webhook delivery needs the Vercel passcode and repository-dispatch token. Do not paste credentials into chat. Confirm a named version produces one issue and one draft PR, then republish unchanged tokens to verify no duplicate commit. Named-version delivery to Meridian was verified through export PR #3. The session-based two-way plugin requires activation; see the current bridge guide.

Code Connect can map Figma components to implementation examples when plan/access permits. It does not automatically turn layouts into working application code, and no false mapping is provided for a component that has not been implemented.

The Meridian reference website builds from the reviewed `design/figma/generated/tokens.json` and mapped `site/content.json`. Its plugin can import GitHub values into native aliases and mapped text while open; arbitrary application layouts/code and prototype reaction timing remain implementation work.
