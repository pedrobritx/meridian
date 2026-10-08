# Meridian Next — Phase 0 baseline and protection

**Snapshot date:** 2026-10-08. **Status:** Remote inspection complete; local reproduction and Figma end-to-end sync remain follow-up checks.

## Verified repository state

- Repository: [pedrobritx/meridian](https://github.com/pedrobritx/meridian), default branch `main`.
- Head: [`64fa860dcca68d5a49854e9a79a25c339e45babe`](https://github.com/pedrobritx/meridian/commit/64fa860dcca68d5a49854e9a79a25c339e45babe), merge of PR #5.
- `package.json`: `0.5.0`, private package, ES modules, Vite reference; no published React library.
- Supported themes: Core, Grass, Paper, Parallel, Canvas, Gallery; 12 profile/appearance combinations, 168 semantic roles per appearance (per repository documentation).
- Canonical export: `design/figma/generated/tokens.json`; derived styles include `styles/tokens.css`.
- Existing Figma config: `design/figma/config.json` with documented frame IDs, modes and bridge target `pedrobritx/meridian`.
- Open issues: 0 at inspection; open pull requests: 0 at inspection; releases endpoint returned none.
- Branch listing included only `main` before creation of planning branch.
- `main` branch metadata says `protected: true`; branch-protection details were inaccessible to the connected integration (403). Do not infer exact rules.

## Remote CI evidence for baseline head

| Workflow | Run | Result | What was observed |
| --- | --- | --- | --- |
| Validate and deploy Meridian | [37721656055](https://github.com/pedrobritx/meridian/actions/runs/37721656055) | Success | `npm ci`, `npm test`, `npm run build`, Playwright browser suite, upload and deploy steps succeeded. |
| Figma Bridge Checks | [37721656077](https://github.com/pedrobritx/meridian/actions/runs/37721656077) | Success | Plugin build, generated-output diff check, and Figma test suite succeeded. |

The [existing validation record](https://github.com/pedrobritx/meridian/blob/main/docs/validation.md) reports 46 passing checks, 32 browser scenarios and 864 contrast pairs in 0.5. These are author-maintained figures, not newly reproduced statistics.

**Local test limitation:** The tool runtime could not resolve `github.com` for git clone. No independent local clone, build, browser tests, native Safari/Firefox test or live Figma plugin session was executed here.

## Baseline Figma inventory

- File: [Meridian](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian).
- Existing reference boards include [theme comparison](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=138-34), [glass state gallery](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=139-206), and [project specimens](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=162-58).
- Existing design includes glass and opaque variants, 48px control targets and profile-specific typography/layout/motion.
- The official reference uses opaque fallbacks for reduced-transparency and unsupported effects.
- A new named Figma version and installed-plugin round trip are NOT independently verified by this Phase 0 review.
- No Figma mutations performed in Phase 0.

## Protection and release policy

1. Keep current `main` untouched during Phase 0.
2. Author planning work in `planning/meridian-next-0.6-living-matter`; propose merge by draft PR.
3. Do not rename current tokens, overwrite generated outputs manually, or rewrite Figma component IDs.
4. Do not change the BSDL repository or consuming products.
5. For implementation, use a separate scoped Lab branch and reviewed PRs.
6. Existing `npm test`, `npm run build`, `npm run test:browser`, Figma token/bridge checks and contrast checks remain regression gates.

## Outstanding verifications

- [ ] Independently clone and rerun baseline test/build/browser commands on a development machine or supported remote runner; attach machine/environment details.
- [ ] Confirm branch protection/ruleset requirements with authorized repository administration access.
- [ ] Confirm a named Figma version and installed plugin round trip without changing approved tokens unexpectedly.
- [ ] Manually test screen readers, Safari, Firefox, native refraction and real-world composited imagery before claiming comprehensive accessibility.
- [ ] Approve this ADR and Lab charter for merge.

## Readiness conclusion

**Phase 0 planning-ready, not fully independently verified.** Two successful remote CI workflows support retaining 0.5.0 as the protected baseline. Unverified external integrations and manual accessibility checks are explicitly carried forward as issues, not asserted complete.
