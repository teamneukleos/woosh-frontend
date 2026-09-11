# Woosh

Creator campaign marketplace and operating system for African brands, agencies, and creators.

**Motion at the speed of culture.**

## Stack

- Next.js 16 BFF (App Router) + TypeScript + Tailwind CSS
- Nest API in the sibling `woosh-backend` repo (Prisma + PostgreSQL)
- Auth.js (next-auth v5) credentials sessions against Nest login

## Docs

- [Product study](docs/PRODUCT_STUDY.md)
- [Open decisions](docs/OPEN_DECISIONS.md)
- [Architecture](docs/ARCHITECTURE.md)

## Setup

1. Install dependencies and copy env:

```bash
npm install
cp .env.example .env
openssl rand -base64 32   # AUTH_SECRET
```

2. Run the Nest API from `woosh-backend` (Postgres, migrate, seed, `npm run start:dev` on port 4000). Point `WOOSH_API_URL` at `http://localhost:4000/api`.

Demo accounts (password `password123`), after `npm run prisma:seed` in `woosh-backend`: `creator@woosh.test`, `brand@woosh.test`, `agency@woosh.test`, `admin@woosh.test`

3. Run this app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register as brand, agency, or creator, then sign in to `/app`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit and policy tests |
| `npm run test:smoke` | Public routes plus authenticated checks when Nest login works |
| `npm run verify` | Lint, tests and production build |
| `npm run start` | Validate production configuration, then start Next.js |
| `npm run start:local` | Start a built app for local smoke testing |
| `npm run config:check:production` | Fail deployment when production Auth.js / Nest URL config is missing |

## Production gate

Before deployment, configure every value in `.env.example`, run
`npm run config:check:production`. Database migrations and demo seed live in
`woosh-backend`. Configure repository secrets `WOOSH_APP_URL` (the HTTPS origin,
without a trailing slash) and `WOOSH_CRON_SECRET` (matching production) to
activate the scheduled jobs in `.github/workflows/operations.yml`.

## MVP boundaries

In scope: onboarding, multi-brand agency tenancy, RBAC, social connect (IG/TikTok/YouTube), briefs, applications, structured negotiation, messaging, campaign workspace, Paystack + ledger, basic analytics, admin/audit.
