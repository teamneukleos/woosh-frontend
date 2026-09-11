# Woosh Architecture

Modular monolith for the first production release (PRD §18), split across two repos.

## Layout

```text
src/
  app/                 # Next.js App Router (UI + BFF route handlers)
  components/          # Shared UI
  domains/             # Bounded contexts (call Nest via src/lib/api.ts)
    identity/
    organisation/
    creator/
    marketplace/
    commercial/
    campaign/
    messaging/
    payments/
    analytics/
    trust/
  lib/                 # auth, Nest client, permissions, brand tokens
```

## Data access

- PostgreSQL and Prisma live in `woosh-backend`
- This app is a BFF: Auth.js cookie + `WOOSH_API_URL`

## Auth

- Auth.js (next-auth v5) JWT sessions
- Credentials provider posts to Nest `POST /auth/login`
- `src/proxy.ts` protects `/app` and `/admin` before render
- RBAC helpers in `src/lib/permissions.ts` (org + brand scopes)

## Payments

- Provider: Paystack (Nest owns collection, payouts, webhooks)
- Woosh owns `PaymentObligation` + `LedgerTransaction`
- Brand funds before creator selection; Woosh platform fee is 0% for brands, agencies and creators

## Social

- Launch channels: Instagram, TikTok, YouTube
- Metrics always show source + last-refreshed; never invent missing API fields

## Non-goals for this scaffold

Microservices · proprietary wallet · React Native · AI matching · public ratings
