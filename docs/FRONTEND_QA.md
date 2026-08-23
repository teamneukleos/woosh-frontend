# Frontend QA checklist (F7)

## Loading / errors
- [x] `/app/loading.tsx` skeletons
- [x] `/app/error.tsx` boundary
- [x] Root `/error.tsx` and `/loading.tsx` for marketing/auth
- [x] `/app/not-found.tsx` in-shell 404
- [x] Toast provider mounted via `Providers`

## Toasts
- [x] `ActionForm` wraps mutations (creators, team invite, admin ops, earnings, settings, briefs, messages, pipeline, social, onboarding)
- [x] Auth/claim forms use `useActionState` inline errors instead of toasts

## Mobile
- [x] Viewport `device-width` + `viewportFit: cover`; `overflow-x: clip` on html/body
- [x] App shell: notch-safe header, fixed bottom tab bar with safe-area padding, content offset
- [x] Jobs list tabs and apply/counter/withdraw forms stack at ~390px
- [x] Brief composer stepper scrolls horizontally without wrapping the page
- [x] Claim, auth, and legal pages use stacked padding on small screens
- [x] Discovery, payments, messages, and deliverable toolbars use `min-w-0` / full-width controls
- [x] Toasts sit above the mobile tab bar
- [x] Inputs are 16px on small screens (no iOS zoom); `min-w-0` + `break-words` on titles and messages

## Accessibility
- [x] Dialog / ConfirmDialog focus via Radix
- [x] Focus rings on kit inputs
- [x] Color-not-only: StatusBadge + text labels present
- [x] Verified state is a blue check with accessible name, not a text chip
- [x] Stepper marks the current step with `aria-current`
