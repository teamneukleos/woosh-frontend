# Build status — Woosh MVP slices

Last updated: 2026-08-21

## UX audit (post S0–S8)
See [`UX_AUDIT.md`](./UX_AUDIT.md). Categories/languages/industries are taxonomy selects; creator follower counts are never typed — Connect starts PENDING OAuth; prospect ops estimates only, labelled unverified.

## Slice 1 — Workspace shell
- App layout with role-based nav (creator / brand / agency / admin)
- Brand switcher cookie (`woosh_active_brand`)
- Attention home at `/app`
- Agency onboarding to create first client brand
- Settings for org / client brand; creators use Profile for taxonomy + social connect

## Slice 2 — Dual creator supply
- `CreatorProspect` model + discovery merge (`listDiscovery`)
- Creators directory `/app/creators` with Unclaimed badge
- Add prospect by handle + category picker; optional ops follower estimate only
- Social connect starts PENDING; metrics from provider sync only

## Slice 3 — Claim invites
- `BrandInterest` + claim token flow
- Interested CTA → invite; `/claim/[token]` register or login merge
- Claim attaches handle as PENDING (creator must connect to verify)
- Notification + email (Resend or console stub) after claim

## Slice 4 — Briefs and apply
- Create / publish briefs (moderation if org unverified)
- Brand briefs list + detail
- Creator jobs feed + apply
- Brief invitations (`inviteToBrief`) → `/app/invitations`

## Slice 5 — Select, negotiate, message
- Pipeline: shortlist / decline / accept → campaign
- **Fund-before-select**: accept commits the creator rate from the brand wallet (0% Woosh platform fee)
- Rate threshold: managers need finance/owner above `WOOSH_ACCEPT_RATE_THRESHOLD`
- Counter + accept offers
- Application/campaign messaging inbox

## Slice 6 — Campaign deliverables
- Campaign list + workspace
- File upload (local `uploads/` or S3) + URL submit
- Request revision / approve → obligation APPROVED
- Mark live / complete deliverable states

## Slice 7 — Payments ledger
- Brand wallet top-up (Paystack checkout or test-mode credit)
- Obligation COMMITTED on accept; APPROVED on deliverable approve
- Paystack transfer payout + webhook; test-mode mark paid when keys empty
- Creator payout bank account on Earnings
- Brand Payments page: wallet, obligations, release payout

## Slice 8 — Admin / notify
- `/app/admin` seed prospects, brief approve/reject, org verify, user admin flags
- `createNotification` + Resend email (console when unset)
- Team invites create `Membership` + email
- Email verification + password reset tokens
- `writeAudit` on critical transitions

## Slice 9 — Creator storefront and intelligence
- Complete creator profile: editable avatar, cover, bio, location, languages, categories, consent-based demographics and availability
- Rate packages by channel/deliverable with price, turnaround, revisions and usage rights
- Moderated image/video/social-embed portfolio CMS
- Profile readiness, brand-view preview and admin publish/reject workflow
- Discovery cards and filters for verified followers, engagement, average views and price
- Full brand creator detail with approved work, channel analytics, audience and rates

## Slice 10 — Creator and campaign analytics
- AES-GCM-encrypted OAuth tokens and provider refresh for Instagram, TikTok and YouTube
- Creator Insights at `/app/insights` for channel growth, profile views, saves, opportunity conversion, campaigns and earnings
- First-party `AnalyticsEvent` instrumentation across saves, invitations, applications and campaign lifecycle
- `CampaignMetric` links to creator/deliverable/submission/post; brand totals dedupe latest post snapshots

## Slice 11 — Production creator work hub
- `/app/work` prioritises expiring invitations, incoming offers, overdue work, revisions and publish actions; terminal work remains in history
- Creator invitation decline, application withdrawal, offer counter/accept and campaign terms acknowledgement are explicit, audited transitions
- Every deliverable belongs to one `CampaignParticipant`; creator campaign reads and submission downloads are assignment-scoped
- Campaign workspace includes requirements, deadlines, rate/terms, version metadata, feedback history, publish URL, portfolio reuse and campaign messages
- Direct-to-S3 upload intents expire after 10 minutes and are finalized only after object size, MIME, magic bytes and deliverable ownership checks; local multipart upload remains the development fallback
- `POST /api/internal/work-reminders` expires invitations and sends idempotent invite/deadline notifications when called by a scheduler with `Authorization: Bearer $WOOSH_CRON_SECRET`
- Analytics now distinguish submission, revision, approval, live and campaign completion events

## Slice 12 — Production creator money system
- Verified Paystack bank onboarding with account-name resolution, masked display, encrypted account numbers and recipient creation
- Serializable wallet commitments with a database non-negative balance constraint and strict finance/tenant permissions
- Creator earnings move through secured, approved, 72-hour release window, processing, paid, failed, disputed and reversed states
- Automatic payout and reconciliation job at `POST /api/internal/payment-releases`, authenticated by `WOOSH_CRON_SECRET`
- Payment disputes freeze release; platform ops can release payout or refund the committed creator rate to the brand wallet
- Creator Earnings and brand Payments expose balances, release dates, provider attempts, failures, ledger activity and support entry points
- Immutable creator statements and brand receipts download as relationship-scoped PDFs
- Paystack webhooks are signature-checked, persisted, amount/currency validated and idempotent; callback verification recovers missed wallet webhooks

## Current provider matrix
- YouTube: subscribers plus recent-video average views and engagement
- TikTok: identity, followers and available account stats
- Instagram: Composio OAuth for Business/Creator accounts linked to a Facebook Page (no typed follower counts)
- Development mode: rich `dev_oauth` snapshots, clearly labelled and never treated as production provider data

Production social OAuth requires `OAUTH_TOKEN_ENCRYPTION_KEY`; legacy plaintext connections must reconnect.

## Slice 13 — Release hardening and unified product UI
- Semantic design tokens, shared responsive `AppPage` scaffolds, icon navigation, mobile drawer/bottom navigation and consistent panels, controls, tables, status badges and feedback
- Persisted notification preferences, password changes and permission-scoped JSON account exports
- Email verification/reset recovery, claim-email ownership checks and active-account enforcement on server mutations and workspace access
- Server-enforced organisation RBAC for briefs, creator invitations, campaign reviews, client brands, team management, analytics and financial operations
- Automated brief moderation, failed Paystack webhook replay and atomic webhook processing claims
- Scheduled payment release, work reminders, provider metric refresh and weekly digests in `.github/workflows/operations.yml`
- Production startup configuration gate, demo-seed safeguards, migrations, representative multi-role seed data and authenticated runtime smoke coverage

## Demo seed
```sh
npx tsx scripts/seed-demo.ts
```
Accounts (password `password123`): `creator@woosh.test`, `brand@woosh.test`, `agency@woosh.test`, `admin@woosh.test`

The seed includes both a direct brand and multi-brand agency, funded wallets and verified organisations. The creator includes approved photo/video portfolio samples, three rate packages, three channel histories, expiring and declined invitations, applied/shortlisted negotiations, overdue/revision/approved/live/completed work, campaign results, first-party events and paid earnings.

## Work-hub production operations
- Run `npm run test:smoke` against a seeded running server. It authenticates creator, direct-brand, agency and admin accounts; checks core route surfaces and PDF output; proves unverified accounts cannot enter the app; and checks unconfigured cron routes fail closed.
- Schedule the reminder endpoint at least daily; hourly is recommended when briefs use short application windows.
- Schedule `POST /api/internal/social-metrics` daily with the cron bearer secret to refresh active provider accounts that are at least 24 hours stale.
- Schedule `POST /api/internal/weekly-digests` once weekly. It respects persisted email preferences and audit-deduplicates each user/week delivery.
- Configure S3 CORS to allow `PUT` from `NEXT_PUBLIC_APP_URL` with the `Content-Type` header. Keep the bucket private; files are read through Woosh relationship-scoped authorization.
- Failed multipart submissions are removed immediately. Finalized submission assets are retained with their version history; deleting a campaign cascades its records but object-store lifecycle cleanup should also be configured.

## Money operations
- Production must set `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYOUT_ACCOUNT_ENCRYPTION_KEY` and `WOOSH_CRON_SECRET`. Test credits and test payouts fail closed when `NODE_ENV=production`.
- Call `POST /api/internal/payment-releases` at least every 15 minutes with `Authorization: Bearer $WOOSH_CRON_SECRET`; it releases eligible obligations and reconciles transfers stuck in `PROCESSING` for 30 minutes.
- Keep Paystack webhook delivery enabled for `/api/paystack/webhook`. Failed events are retained in `ProviderWebhookEvent` for replay/debugging.
- Bank account edits always resolve and create a new transfer recipient. Full account numbers are encrypted and never returned to the UI or financial PDFs.
- Statements snapshot paid obligations for one calendar month. Brand receipts are generated once after payout success and remain immutable.

## Deployment verification
- `npm run verify` is the local lint, unit-test and production-build gate.
- `npm run config:check:production` rejects missing Nest API URL, placeholder/short secrets, insecure app URLs and production dev-OAuth.
- Database migrate/seed live in `woosh-backend` (`npm run prisma:migrate`, `npm run prisma:seed`).
- `.github/workflows/ci.yml` lints, tests, builds, and smokes public Next routes. Authenticated smoke needs Nest login.
