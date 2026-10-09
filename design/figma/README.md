# Meridian ↔ GitHub → website

Source: [Meridian Figma](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn).
Destination: **[pedrobritx/meridian](https://github.com/pedrobritx/meridian)**.
File/repository allowlists and review-frame IDs are in `config.json`. Lexis is a Paper consumer, not the publication destination.


## Forest-first Living Matter 0.6 — GitHub → native Figma

The actual editable design is on [Figma page 15 · Lab · Forest-first 0.6](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=218-21). Dawn and Dusk are real Figma frames with bound, independently scoped **Meridian 0.6 Lab / Forest** variables; 0.5 published foundations/components are intentionally unchanged.

### GitHub source contract

- `lab/forest-reference/forest-model.js` owns the Forest Lab palette; the matching [machine-readable Figma mapping](forest-lab.json) records native variable collection, modes, exact editable text node IDs and values. `scripts/figma/forest-contract.test.mjs` **fails CI** if those values drift.
- `scripts/figma/forest-contract.mjs` validates the strict allowlist (12 colour roles × 2 modes plus 6 editable text nodes) before any native write. Unknown roles, page IDs, replaced layers or unexpected modes fail safely.
- The native plugin's Forest path never creates, deletes or rewrites existing stable 0.5 components, canonical semantic variables or layout nodes. It updates only the Forest collection values and six known text nodes after snapshot verification; write errors trigger rollback.
- Lab layout/geometry changes require editable-frame review, not automatic REST/API re-creation.

### Activate near-real-time sync while Figma is open

1. Pull the latest `main`, run `npm run build` and import or reimport [plugin/manifest.json](plugin/manifest.json) via Figma desktop → Plugins → Development.
2. Open the configured Meridian Figma file. In **Meridian ↔ GitHub**, enter a *session-only* fine-grained token for `pedrobritx/meridian` (Contents read; use Contents write only if using the existing Figma → GitHub publication flow).
3. Under **Forest-first 0.6 · Lab sync**, click **Compare Forest**. On a mismatch, review the diff and explicitly click **Apply GitHub Forest** to establish the baseline.
4. Enable **Auto-apply Forest while this plugin is open**. It checks GitHub `main` every 30 seconds and imports approved Forest changes only when the local snapshot still matches the previous baseline.
5. If Figma and GitHub changed independently, polling **stops** instead of overwriting local design edits. Compare and reconcile deliberately.

**Limit:** This is session-based, not a permanently running cloud writer. The GitHub Actions runner cannot use the standard Figma REST API to arbitrarily edit native page frames. The separate [Forest Lab Figma handoff workflow](../../.github/workflows/forest-figma-handoff.yml) runs when Lab sources change on `main` and creates/updates a review issue; it **does not** certify Figma is already updated. An unattended Figma canvas-write service would require a separately authorised, continuously available Figma editing runtime.

### Validation

```sh
npm run test:figma
npm test
npm run build
```

A passing CI suite proves the contract and plugin logic against mocks, **not** a live plugin session. Verify a deliberate, harmless GitHub change reaches the Figma native variables and texts while the plugin remains open; confirm stable 0.5 variables and shared button instances are unchanged. The experiment and accessibility evaluation remain open under [#12](https://github.com/pedrobritx/meridian/issues/12).

## What synchronises

| Change | Trigger | Review output |
| --- | --- | --- |
| Layers, text, layout, component properties and prototype metadata | Save a **named version**; scheduled check every six hours, manual workflow, or optional webhook | Version-specific layer diff, PNG review previews, handoff issue and one accumulating draft PR |
| Native semantic variables and ten mapped text layers | Plugin → **Publish Figma for review**, or live mode while open | Validated twelve-mode tokens, mapped copy, CSS and a draft PR; the full contract is stored as an immutable Git blob and dispatched by SHA |
| GitHub tokens and mapped text on `main` | Plugin → **Apply GitHub values**, or live mode while open | Updates native primitive cells through aliases and editable text layers |
| Shared contract and runtime source on GitHub | Merge into `main` | Validate, build and deploy GitHub Pages |

Autosaves are ignored. This is not an every-keystroke mirror, and a named version does not automatically export native variables on Education plans. The Variables REST API requires a different plan; the development plugin avoids that requirement. Live mode is session-based, not a server-side Figma writer. Exports never merge themselves or generate arbitrary application code.

Artifacts live in `generated/`. `tokens.json` is the canonical resolved 0.5 library export; `meridian.css` uses scoped `--meridian-*` variables. The website derives `styles/tokens.css` from the same canonical bundle, with `--md-*` names. `site/content.json` maps ten editable text nodes on the Core and themes page. Changing either contract on `main` updates the next website build. Archive `tokens/legacy-0.1.json` is not consumed.

## Activate

### Named-version polling (no receiver deployment required)

1. Merge the bridge PR into **Meridian's `main`**. Repository-dispatch and scheduled workflows must exist on the default branch.
2. In [Meridian Actions settings](https://github.com/pedrobritx/meridian/settings/actions), enable **Allow GitHub Actions to create and approve pull requests**.
3. Create a Figma personal access token with `file_content:read` and `file_versions:read`. Store it as **FIGMA_ACCESS_TOKEN** in [Meridian Actions secrets](https://github.com/pedrobritx/meridian/settings/secrets/actions). Renew it before expiry. Do not send credentials in chat.
4. Save a named version such as **Meridian 0.5 · Purposeful profiles verification**.
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

## Activate two-way contract synchronization

After this update reaches `main`, download the repository and import `plugin/manifest.json` in Figma desktop through **Plugins → Development → Import plugin from manifest**. Run **Meridian ↔ GitHub** in the configured file. Reimport the manifest to replace an older plugin.

1. Enter a fine-grained GitHub token restricted to **pedrobritx/meridian**, with **Contents: Read and write**. This is separate from the repository's `FIGMA_ACCESS_TOKEN` secret. The plugin password field clears after reading; the credential remains only in session memory until Disconnect or closing the plugin.
2. Choose **Compare**. If both sides match, the plugin establishes a baseline. If they differ on first use, explicitly choose **Apply GitHub values** or **Publish Figma for review**.
3. Optionally enable **Live while this plugin is open**. Every 30 seconds, a GitHub-only change is imported; a Figma-only change is published once for review. Closing the plugin stops live synchronization. Wait for the export PR to merge before the website or GitHub baseline advances.
4. If both sides changed since the baseline, live mode stops. Compare and choose a version explicitly; no automatic overwrite occurs. A publication whose GitHub baseline is stale is rejected by the workflow.

Imports preserve aliases, bindings and instances. Variables sharing a primitive must be edited together in the resolved JSON; incompatible values are rejected instead of flattening bindings. Imports require the existing semantic names and mapped node IDs. New tokens or deleted/replaced mapped layers need an intentional library/mapping update and a plugin rebuild. Import failures roll back applied variable and text changes.

Edit **`design/figma/generated/tokens.json`** and **`site/content.json`**, then run `npm run build`. Do not edit generated CSS or plugin bundles. `generated/content-baseline.json` records mutually published text and must not be advanced by a GitHub-only wording edit. Values are validated and shared text is escaped before HTML rendering.

Arbitrary layout, prototype, new component, HTML and JavaScript changes do not round-trip. Named versions still produce visual handoff diffs/previews for those changes. The existing old named version lacks the current profile text nodes: save a **new named version of 0.4** before testing the named-version path.

## Confirm end to end

1. Save a new, deliberately named Figma version. For a meaningful delta, make a harmless documentation wording change first.
2. For immediate delivery, confirm that the registered webhook reports ACTIVE and its delivery succeeds. Find the GitHub run with event **repository_dispatch**. A manual run tests the workflow but does not prove webhook activation; a scheduled run proves polling only.
3. Verify the run finishes successfully and its generated `snapshot.json` names the same Figma file key and version ID. Compare `changes.json` and the rendered review frames with that named version.
4. Confirm both the issue and draft PR are in **pedrobritx/meridian**, with head branch `design/figma-sync` and base `main`.
5. Publish a changed token or mapped text through the plugin. Confirm `tokens.json` and `meridian.css` show the intended change across the correct profile modes. Publish an unchanged contract again; it should not create another commit or issue.
6. Change a mapped text on GitHub, merge it into `main`, then Compare/Apply or observe live mode. Confirm the Figma text and website match. Edit both sides independently and confirm live mode pauses.
7. Repeat delivery of the same named version. It should reuse the existing review work; an older delayed version must not rewind it.

Generated exports are review artifacts until merged. The workflow's `GITHUB_TOKEN` does not trigger other PR Actions automatically; if required checks are absent on a bot PR, close and reopen it using your account before merging.

## Validation and recovery

```sh
npm run test:figma
```

Tests execute the actual export/sync code with mocked HTTP and native provenance. They cover four-mode resolution, contrast, generated CSS, correct repository routing, authentication, limits, event filtering, version export, replay protection and PR recovery. They do not prove real credentials or webhook activation.

`generated/figma-source.json` is a separately captured native alias/style provenance snapshot. Token-only publication does not refresh it. [Profile configuration](../meridian/profiles.md) and [product adoption](../meridian/integration.md) explain the design/runtime boundaries.

Pending bot exports are checked for duplicate delivery. The plugin compares against `main`; unmerged review changes are not yet website releases. If `main` advances independently while an export is pending, the workflow stops and requires the pending PR to be resolved before further exports. If PR creation fails after an export commit, rerun to recover the existing draft PR. To disable delivery, deactivate the webhook and disable this repository's workflow.
