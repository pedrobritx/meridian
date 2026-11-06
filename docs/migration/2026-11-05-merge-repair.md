# Glass integration merge repair

PRs #52 and #54 merged with successful validation. PR #56 subsequently combined historical ten-environment definitions with the approved six-family contract, leaving invalid JSON, duplicate imports/declarations, incomplete test blocks and a duplicated historical footer. Main at 18d58e35324352137eef1ae6ecdbcc76e761fd53 failed its unit checks before build/deployment.

This repair restores the approved six-environment manifest and compatibility archive, retains the glass runtime and semantic selection roles, removes malformed merge remnants and provides opaque system-preference fallbacks for native slider/switch layers. The reduced-transparency verifier now distinguishes `none` from a blur without whitespace backtracking. Current documentation distinguishes the historical material inventory from the active six-family direction.

Validation: 125 unit checks and the production build pass. The repaired build passed all 178 desktop/mobile browser cases, including the new material interactions. A final gallery correction aligns each card, label and action with its environment; all 12 focused Chromium desktop/mobile and WebKit gallery cases pass. Full three-engine CI remains the final acceptance check. No Figma writes or stable publication are part of this repair.
