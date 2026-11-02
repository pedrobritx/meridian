# Phase 2: sync and links repaired (2026-11-02)

- **Plan:** `docs/roadmap/1.0-library-and-site.md`, phase 2. **Tracker:** #43.
- **Branch:** `sync/phase-2-repair`, from `main` after #41.
- **Labels:** EXISTING = read from Figma or the repo. PROPOSED = needs your review. UNVALIDATED = not checked.

## What changed

### 1. The plugin's token capture works on the current file

The capture treated every collection named `Meridian / ...` as a 0.5 profile collection. The 0.6 collections have environment or appearance modes, so capture threw `Missing profile mode`, and Compare, Publish and Apply GitHub values could not run.

- Capture now reads an explicit list of contract collections: Colour, Project Colour, Layout, Typography, Motion and Elevation.
- **PROPOSED:** the nine `motion/liquid/*` variables are treated as internal aliases behind the public motion tokens, so they stay out of `tokens.json`. Making them public would be an API addition (a minor release), so it should be a deliberate decision.
- On the structure exported on 2026-11-01, capture yields exactly the 168 names in `tokens.json`. A new test reproduces the old failure.
- The plugin bundle is rebuilt. **To use it, reload the development plugin in Figma.**

### 2. Figma and GitHub agree, apart from one held value

A read-only run in Figma resolved all 168 tokens in all twelve appearances with the repo's capture logic, then compared hashes with `tokens.json`.

- **167 of 168 match.**
- The one difference is `motion/duration/contact`: Figma 120 ms, GitHub 80 ms. This is the deliberate hold from phase 1, fix F1.

### 3. The provenance ledger stays exact

`figma-source.json` is a native capture taken on 2026-10-08. Plugin publications do not refresh it, so any Figma token publication used to fail the contract test.

`provenance-overrides.json` is now a ledger of every value newer than that capture, per token and appearance, each with its source and decision:
- `figma-sync.yml` rewrites it in each plugin publication PR.
- `node scripts/build-provenance-overrides.mjs "<source>" "<decision>"` rewrites it after a GitHub edit.
- The contract test requires that capture plus ledger equals `tokens.json`, and that rebuilding the ledger changes nothing.

**Not done:** a fresh native capture. Its exact values would have to pass through this conversation, which is not practical at about 700 variables. The ledger makes the gap explicit instead. **PROPOSED:** add provenance capture to the plugin's publication later.

### 4. Figma links checked and repaired

All 490 node IDs that the repo references were checked against the file (read-only). 15 no longer exist and 117 sit on the Archive page. Results and policy are in `design/figma/links.json`:

| Policy | Files | Rule |
| --- | --- | --- |
| Live | `design/figma/config.json` (named-version previews) | Must be on a live page |
| Archived allowed | Site copy mapping, Forest Lab, website and README links, Lab READMEs | May stay on the Archive page until it moves to the lab file. Never missing |
| Historical | `figma-manifest.json`, `figma-refactor-map.json`, `docs/figma-library.json` | Kept as written and marked superseded by `design/figma-export/` |

Repairs:
- **Preview frames:** the 12 archived ones are replaced with current frames: the directories, the environment review, the symbol catalogue, the glass components, Navigation / Liquid dock, Button, Field and Meridian / List item.
- **Site copy mapping:** it named a deleted page (`92:34`). It now names the Archive page, where its ten text layers actually live. The text and node IDs are unchanged.

Checks:
- `tests/figma-links.test.mjs` enforces the policy offline and fails on any node ID it doesn't know.
- `figma-sync.yml` recomputes `links.json` from the file document at every named version, so each export PR shows link drift.

## Answers found along the way (EXISTING)

- **Figma token secret:** the repo already has one, `FIGMA_GITHUB_CONSTELLATION`, used by `figma-sync.yml` (export PR #39 came from it).
- **Site copy mapping:** its ten text layers exist, on the archived frame "Meridian / Core + profiles" (`92:35`). Moving them to the website file is phase 4 or 5 work.

## Verification

- `npm test`: 80 of 80 pass. Every new check was also run against a deliberately broken input and failed as expected:
  - stale or unknown ledger entries;
  - an archived, unknown or missing node ID;
  - the 0.6 collections in the capture.
- The `figma-sync.yml` wiring for the ledger and links is covered through the existing end-to-end mock of the workflow.
- Browser tests: see the PR.
- **Not verified:** the rebuilt plugin inside Figma; the workflow against the real GitHub and Figma APIs.
