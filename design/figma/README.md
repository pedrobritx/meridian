# Meridian → Meridian GitHub

Source: [Meridian Figma](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn).
Destination: **[pedrobritx/meridian](https://github.com/pedrobritx/meridian)**.
File/repository allowlists and review-frame IDs are in `config.json`. Lexis is a Paper consumer, not the publication destination.

## What synchronises

| Change | Trigger | Review output |
| --- | --- | --- |
| Layers, text, layout, component properties and prototype metadata | Save a **named version**; scheduled check every six hours, manual workflow, or optional webhook | Version-specific layer diff, PNG review previews, handoff issue and one accumulating draft PR |
| Native semantic variables | Development plugin → **Publish for review** | Validated Grass/Paper light/dark `tokens.json` and reproducible `meridian.css` in the same draft PR |

Autosaves are ignored. This is not an every-keystroke mirror, and a named version does not automatically export native variables on Education plans. The Variables REST API requires a different plan; the explicit plugin path avoids that requirement. Exports never merge themselves or generate application code.

Artifacts live in `generated/`. `tokens.json` is the canonical resolved 0.4 library export; `meridian.css` uses scoped `--meridian-*` variables. The existing website's `tokens/meridian.json` and `styles/tokens.css` are the 0.1 implementation, not automatically rewritten by this bridge. Adopt library changes into the runtime through a separate reviewed change.

## Activate

### Named-version polling (no receiver deployment required)

1. Merge the bridge PR into **Meridian's `main`**. Repository-dispatch and scheduled workflows must exist on the default branch.
2. In [Meridian Actions settings](https://github.com/pedrobritx/meridian/settings/actions), enable **Allow GitHub Actions to create and approve pull requests**.
3. Create a Figma personal access token with `file_content:read` and `file_versions:read`. Store it as **FIGMA_ACCESS_TOKEN** in [Meridian Actions secrets](https://github.com/pedrobritx/meridian/settings/secrets/actions). Renew it before expiry. Do not send credentials in chat.
4. Save a named version such as **Meridian 0.4 · Grass + Paper sync verification**.
5. Run [Figma Design Sync](https://github.com/pedrobritx/meridian/actions/workflows/figma-sync.yml) manually with a blank version ID, or wait for the scheduled check. It should create a handoff issue and a draft PR on `design/figma-sync` in **Meridian**.

Missing credentials and API failures fail the run; test-suite success alone does not establish live synchronization.

### Optional immediate webhook delivery

GitHub Pages is static and cannot receive Figma POSTs. Deploy the included `api/figma-webhook.mjs` on a Node-capable host such as Vercel. No live receiver has been deployed or registered by this change.

- Use a publicly reachable HTTPS `/api/figma-webhook` route without login protection. A GET returns 405; an authenticated Figma PING returns 200. GET availability alone does not prove authentication or delivery.
- On that host, set **FIGMA_GITHUB_DISPATCH_TOKEN** to a fine-grained GitHub token restricted to **meridian** with **Contents: Read and write**. This permission is required for repository dispatch.
- Generate a passcode (`openssl rand -hex 24`) and set **FIGMA_WEBHOOK_PASSCODE** on the host. Redeploy after changing production environment variables.
- Give the local Figma token `webhooks:read` and `webhooks:write` as well. Set `FIGMA_ACCESS_TOKEN`, the matching `FIGMA_WEBHOOK_PASSCODE` and your actual `FIGMA_WEBHOOK_URL` in your local environment, then run:

```sh
node scripts/figma/register-webhook.mjs
```

Registration is idempotent and prints only webhook ID/status. The receiver authenticates the passcode, rejects unrelated files, ignores autosaves, and forwards only a named version ID to **pedrobritx/meridian**. The six-hour polling check remains a backup.

## Publish native tokens

In Figma desktop, import `plugin/manifest.json` through **Plugins → Development → Import plugin from manifest**. Open the configured Meridian file and run **Meridian → GitHub**. Reimport the manifest from this repository if an older Lexis-targeted development plugin was installed.

- **Download JSON** resolves all 165 semantic tokens in each of the four modes without credentials.
- **Publish for review** needs a fine-grained GitHub token restricted to **meridian** with Contents write. Enter it only in the plugin password field. It goes directly to GitHub, is cleared on submit, and is never stored.

The plugin does not change the canvas. Missing profile modes, wrong files, invalid values and malformed exports are rejected. The initial checked-in export was compared read-only with the live Figma variables; zero differences were found across 660 mode/token values. This capture does not prove automatic delivery.

## Confirm end to end

1. Save a new, deliberately named Figma version. For a meaningful delta, make a harmless documentation wording change first.
2. For immediate delivery, confirm that the registered webhook reports ACTIVE and its delivery succeeds. Find the GitHub run with event **repository_dispatch**. A manual run tests the workflow but does not prove webhook activation; a scheduled run proves polling only.
3. Verify the run finishes successfully and its generated `snapshot.json` names the same Figma file key and version ID. Compare `changes.json` and the rendered review frames with that named version.
4. Confirm both the issue and draft PR are in **pedrobritx/meridian**, with head branch `design/figma-sync` and base `main`.
5. Publish a changed token through the plugin. Confirm `tokens.json` and `meridian.css` show the intended change across the correct profile modes. Publish unchanged tokens again; it should not create another commit or issue.
6. Repeat delivery of the same named version. It should reuse the existing review work; an older delayed version must not rewind it.

Generated exports are review artifacts until merged. The workflow's `GITHUB_TOKEN` does not trigger other PR Actions automatically; if required checks are absent on a bot PR, close and reopen it using your account before merging.

## Validation and recovery

```sh
npm run test:figma
```

Tests execute the actual export/sync code with mocked HTTP and native provenance. They cover four-mode resolution, contrast, generated CSS, correct repository routing, authentication, limits, event filtering, version export, replay protection and PR recovery. They do not prove real credentials or webhook activation.

`generated/figma-source.json` is a separately captured native alias/style provenance snapshot. Token-only publication does not refresh it. [Profile configuration](../meridian/profiles.md) and [product adoption](../meridian/integration.md) explain the design/runtime boundaries.

Pending bot exports are the baseline before merge; after merge, the baseline persists on `main`. If PR creation fails after an export commit, rerun to recover the existing draft PR. To disable delivery, deactivate the webhook and disable this repository's workflow.
