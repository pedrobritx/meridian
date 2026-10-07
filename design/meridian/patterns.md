# Patterns and complex flows

## Validation: edit → submit → correct → confirm

Validate after blur for a touched field; do not interrupt first-time typing. On submit, show an error summary at the top, move focus to it and link each message to its field. Keep every entered value. Inline copy names the fix: **“Enter a display name to continue.”** Use `aria-describedby` and `aria-invalid`. After a valid retry, show **“Your preferences are saved.”** only after persistence succeeds. A network error says **“We couldn’t save. Your changes are kept. Try again.”**, not “Invalid input”.

## Global failure, 404 and empty states

- **Global failure:** “Your library couldn’t load.” Explain that saved work is safe; offer **Try again** and **Back to library**. Preserve available navigation. Do not fabricate a successful retry.
- **404:** “This page has wandered.” Explain that the link may have changed; offer **Back to library** and search. Use an actual HTTP 404 in code; do not mislabel an empty result as 404.
- **First-use empty:** “A place for your first note.” Explain what will appear and offer **Create a note**. Avoid celebratory clutter or a disabled primary action.
- **Permission empty:** Explain access and offer **Request access** only if the product supports it. Do not imply missing permission is a system error.

## Search and filtering

Persistent label **Search your library**, clear action with an accessible name, and Enter to submit. Debounce suggestions by 250ms; cancel stale requests and never replace a newer query with an older response. Announce the settled count politely. Filters have visible labels, selected values, count and **Clear filters**. Preserve query/filter state in URL where appropriate.

On mobile open the filter panel as a dismissible sheet; **Apply filters** commits staged choices and **Cancel** restores the previous selection. Desktop immediate filters must announce updated counts without moving focus.

Zero results copy: **“No notes match ‘ocean’.”** Then **“Try a shorter phrase or remove a filter.”** Actions: **Clear filters**, **Edit search**. Keep the query and filter controls visible. Distinguish this from first-use empty and network failure. Loading keeps the results region sized; failure offers retry using the same query.

## Confirmation

For reversible actions, act and offer Undo. For destructive/irreversible actions, open a focused dialog: **“Delete this note?”**, **“This permanently removes ‘Field notes’.”**, actions **Keep note** and **Delete note**. Initial focus lands on the safe action for a destructive decision. Escape cancels; return focus to the trigger or a logical successor if it was removed. Error remains in the dialog with a retry; success closes and confirms once. Never use “OK” for an irreversible action.

## Onboarding

Welcome → choose a reading preference → review → confirmation. Explain the benefit, give a truthful progress indicator, allow optional steps to be skipped, and keep Back available. **“Make yourself at home.”** / **“Choose a rhythm that works for you.”** / **“You’re ready to begin.”** Do not force optional profile data or use a marketing carousel as a mandatory barrier. A screen-reader user receives the new step heading on navigation.

## Multi-step form

Three named stages: **Your details → Preferences → Review**. Save draft state between stages, validate only the current stage on Continue, and preserve previous answers on Back. The Review stage has an Edit action for each section. Final action is **Save preferences**, then a labelled loading state. Prevent duplicate submission while preserving Cancel when cancellation is safe. Completion is a separate confirmed state. If connectivity fails, remain on Review and offer Retry without repeating previous steps.

## Prototype scope

Figma examples use editable linked components and show the screens and transitions between the key steps. They are not connected to storage or a real search service. Keyboard focus management, live announcements, URL state and async race handling are implementation acceptance criteria.
