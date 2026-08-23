# Woosh

Creator campaign marketplace and operating system for African brands, agencies, and creators.

**Motion at the speed of culture.**

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- Auth.js (next-auth v5) credentials sessions
- Modular domain folders under `src/domains/`

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
openssl rand -base64 32   # payout/OAuth/cron encryption secrets
```

2. Start PostgreSQL and apply migrations:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
```

Or point `DATABASE_URL` at any Postgres 16+ instance, then migrate.

Demo seed (optional):

```bash
npm run db:seed
```

Accounts (password `password123`): `creator@woosh.test`, `brand@woosh.test`, `agency@woosh.test`, `admin@woosh.test`

3. Run the app:

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
| `npm run test:smoke` | Authenticated creator/brand/agency/admin route checks |
| `npm run verify` | Lint, tests and production build |
| `npm run start` | Validate production configuration, then start Next.js |
| `npm run start:local` | Start a built app for local smoke testing |
| `npm run config:check:production` | Fail deployment when production providers or secrets are missing |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:migrate:deploy` | Apply committed migrations in production |
| `npm run db:seed` | Reset and seed the local demo universe |
| `npm run db:studio` | Prisma Studio |

## Production gate

Before deployment, configure every value in `.env.example`, run
`npm run config:check:production`, then run `npm run db:migrate:deploy`.
Production requires Paystack, Resend, private S3 storage and all three social
provider apps. The included CI workflow applies migrations, seeds PostgreSQL,
runs lint/tests/build, starts the production app and executes authenticated
multi-role smoke coverage. Configure repository secrets `WOOSH_APP_URL` (the
HTTPS origin, without a trailing slash) and `WOOSH_CRON_SECRET` (matching
production) to activate the scheduled jobs in
`.github/workflows/operations.yml`.

## MVP boundaries

In scope: onboarding, multi-brand agency tenancy, RBAC, social connect (IG/TikTok/YouTube), briefs, applications, structured negotiation, messaging, campaign workspace, Paystack + ledger, basic analytics, admin/audit.

Out of scope: proprietary wallet, microservices, AI content generation, public ratings without safeguards.
