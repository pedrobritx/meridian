# Validation — Meridian


## Current material implementation — 14 October 2026

- Production build passes with all declared font packages installed.
- 83 unit and contract checks pass, including twenty environment/appearance combinations, Forest/Desert compatibility and native maintenance guards.
- The full Chromium run and focused follow-up checks cover 128 desktop/mobile scenarios. Two obsolete five-environment catalogue expectations were updated and the catalogue rerun passed. Subsequent material, native-popover and keyboard checks exercised production CSS and both native top-layer and coordinate-fallback placement.
- Targeted real-page checks cover 320px/390px menus, desktop selection, foreground frosting, actual menu actions, reduced motion and visible forced-color inputs. The top-layer menu blurs underlying content while preserving DOM ownership and action delegation.
- All twenty Universal material compositions pass automated A/AA checks. The main reference's seven routes passed profile/appearance coverage, and all five Lab entries render without default horizontal overflow.
- Figma current masters and examples were updated with semantic tint, softened rims, retained contact/elevation shadows and GLASS effects. Eight toolbar variants, four popover variants and a linked 64px XL option were created and visually reviewed. Aurora Dusk and Forest Dawn/Dusk were inspected in the actual native canvas.
- Archive was excluded from restyling. Historical paints were pinned and representative original controls retain their previous colors, opacity and shadow/glass settings. A complete original-to-final pixel comparison was not captured; exact Archive checksum equality was not established after native override processing. Do not treat this as certification of byte-for-byte archival identity.

Chromium was used at desktop and mobile sizes through regular Playwright because the Browser plugin was unavailable. Actual page/CSS checks complement event-level fixtures. These changes have not been deployed or promoted to a stable release. Safari/Firefox, assistive-technology sessions and arbitrary-image optical contrast remain contextual adoption checks.

## Live Figma reconciliation — 14 October 2026

### Shadow clipping follow-up

The browser comment exposed an omitted layout check: selected-button shadows were clipped by transparent navigation rows. A fresh scan of all five active pages found 167 visible shadow/ancestor cutoff risks. Ninety-six layout and component-preview containers now allow optical overflow. Six transparent responsive navigation wrappers had obsolete effects; their duplicate effects were cleared while retaining the actual glass navigation plane and selected lens. Intentional atmosphere, artwork and responsive-window masks remain.

The saved-file scan now checks 1,056 visible shadowed elements and reports zero cutoff risks. Material fallback/nesting checks report zero violations across 522 bound glass surfaces, and the ten opaque accessibility source variants retain zero GLASS effects. The marked Core/Forest environment row, toolbar/popover sources and responsive Dusk reading specimen were rendered and reviewed. Archive's clipping fingerprint is unchanged by this follow-up. This evidence corrects the earlier audit's incomplete coverage of shadow clipping; it is not a claim that every possible visual defect has been eliminated.

Fresh inspection found remaining opaque icon buttons, action groups, dialogs and selection controls, plus less-frosted buttons inside overlays. These gaps were corrected in the existing native sources and linked active examples. The final checks cover 464 glass surfaces, clear/opaque sibling states, semantic paint fallbacks and monotonic nested frosting. Ten reduced-transparency/high-contrast source variants retain zero GLASS effects. Neutral rims on 271 active objects were softened, with focus/error/accessibility indicators preserved. The nested table pagination override was reset without changing its text or geometry; a fresh call confirmed that its selected lens persists.

The functional component section, Aurora Dusk composition and Dusk dialog were visually reviewed in the live file. The current map records the additional sources and the two foreground material aliases. This is a saved native-file update; no library publication or deployment was performed.

Archive geometry matches the beginning of this reconciliation across 10,208 nodes. Eighteen archived examples inherited new effects from previously empty source effects; their prior empty effects were restored as explicit overrides. Representative historical solid buttons and the original 0.72/0.82 glass specimens retain their older optical settings. The complete optical fingerprint still differs from the starting fingerprint, so full Archive appearance equality remains unverified. This limit is separate from the passing active-material checks.

## Historical stable 0.5 evidence

Executed locally on 8 October 2026:

- `npm test`: 46 passing checks for twelve-mode parity, exact native snapshot equality, generated CSS, alias-preserving imports, opaque/composited contrast, immutable-blob publication, stale-main/conflict protection, mapped text, rollback and sync orchestration.
- `npm run build`: production build succeeds and regenerates both CSS consumers and the importable plugin. Eight font families and their unchanged licences are self-hosted.
- Browser coverage: all seven routes in six profiles × light/dark passed axe A/AA and horizontal-overflow checks at desktop and 390px mobile widths. The full route/keyboard run passed 32 scenarios. After the immediate opaque-fallback fix, the two new glass keyboard/reduced-transparency/forced-colour scenarios passed a targeted rerun. Tabs, dialog focus, local form validation, persistence, row-owned hover and reduced motion are covered.
- `node scripts/build-contrast-report.mjs`: 864 passing pairs. Minimum text contrast is 4.6836:1; minimum control/focus contrast is 3.0024:1. Checks include supported solid surfaces and glass composites over those surfaces plus black/white extremes.
- Figma: five editable project specimens in light/dark, 168 editable text layers and 40 linked instances on the project board; no child overflow. Button sets have 48px targets and valid internal state destinations. Final native screenshots were reviewed; six screenshot artifacts are saved in `design/meridian/previews/`.

Chromium used `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. Native tokens and mapped copy were read from the current live Figma file. The content baseline matches the saved Figma and GitHub source. Layout/component edits persisted through use_figma. The editing API cannot create a named Figma history version; this is a saved current-file update.

The development plugin mutation and publication paths were exercised with mocked native/HTTP APIs. The immutable-blob transport preserves the complete 136KB contract within GitHub’s dispatch limit. An installed plugin session and a new named-version export are separate integration checks; no claim is made that a webhook is active or the review branch is deployed.

Native refraction over arbitrary imagery, human screen-reader checks and Safari/Firefox remain contextual adoption checks. Automated checks are not full WCAG certification. Ambientis Grass/Terra is a proposal based on its documented foundation, not an approved production palette or compliance stamp.
