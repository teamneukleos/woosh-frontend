# Woosh Architecture

Modular monolith for the first production release (PRD §18).

## Layout

```text
src/
  app/                 # Next.js App Router (UI + route handlers)
  components/          # Shared UI
  domains/             # Bounded contexts (business logic)
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
  lib/                 # db, auth, permissions, brand tokens
  generated/prisma/    # Prisma Client output (generated)
prisma/
  schema.prisma
```

## Data access

- PostgreSQL via Prisma 7 + `@prisma/adapter-pg`
- `DATABASE_URL` in `.env` / `prisma.config.ts`
- Generate client: `npm run db:generate`
- Migrate: `npm run db:migrate`

## Auth

- Auth.js (next-auth v5) JWT sessions
- Credentials provider for MVP email/password
- `src/proxy.ts` protects `/app` and `/admin` before render
- RBAC helpers in `src/lib/permissions.ts` (org + brand scopes)

## Payments

- Provider: Paystack (abstraction in `domains/payments`)
- Woosh owns `PaymentObligation` + `LedgerTransaction`
- Brand funds before creator selection; Woosh platform fee is 0% for brands, agencies and creators

## Social

- Launch channels: Instagram, TikTok, YouTube
- Metrics always show source + last-refreshed; never invent missing API fields

## Non-goals for this scaffold

Microservices · proprietary wallet · React Native · AI matching · public ratings
