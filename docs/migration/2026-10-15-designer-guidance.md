# Designer guidance relocation — 15 October 2026

The owner authorised relocating the specialist designer role from Polaris to Meridian. `agents/designer.md` now uses Meridian's existing source, adoption and validation guidance and preserves product-specific identity. The source commit/blob and adapted content hash are recorded in `migration/provenance.json`.

This adds contributor guidance only. Stable design tokens, runtime code, generated assets, Figma state, workflows and consuming products are unchanged. Full Polaris governance and Axis architecture remain explicit optional adoptions.

The existing test suite and build passed. No UI behaviour changed, so browser/AT tests were not rerun and no new accessibility claim is made. No package release or licence selection is performed.
