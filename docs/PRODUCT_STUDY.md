# Woosh Product Study

Shared product memory distilled from the PRD v1.0 and Brand Guidelines (July 2026).

## One sentence

Woosh is a creator campaign marketplace and operating system where brands and agencies discover creators, publish paid briefs, receive applications, negotiate where permitted, manage execution, and measure outcomes — Nigeria first, Africa-ready.

## Brand

- Promise: **Motion at the speed of culture**
- Tagline: **Launch Faster. Scale Smarter.**
- Personality: Swift, modern, efficient, tech-driven, professional
- Focus: micro and nano creators
- Colours: Electric Blue `#003AF4`, Dark Navy `#091B68`, Bright Teal `#0DE3AF`, Black / Dull Black / Soft Grey / White
- Type: Avenir (web: Nunito Sans fallback until licensed Avenir is available)

## Operating modes

1. Marketplace — open / invite-only / hybrid briefs
2. Creator intelligence — verified social search
3. Campaign operations — message, negotiate, deliver, pay, audit

Agency multi-brand tenancy is foundational.

## Core loop

Search or publish brief → attract/invite → review data → shortlist/select → negotiate when allowed → execute → approve → pay → measure → reuse creators.

## Stack (modular monolith)

Next.js + TypeScript · Tailwind · PostgreSQL + Prisma 7 · Auth.js · Redis/BullMQ (later) · S3 · Paystack behind ledger · AWS · GitHub Actions

Domain folders live under `src/domains/`.

## Related docs

- [Open decisions](./OPEN_DECISIONS.md)
- [Architecture](./ARCHITECTURE.md)
