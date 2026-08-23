# Woosh — Resolved Open Decisions (PRD §24.1)

Resolved for MVP architecture so scaffolding and domain design can proceed. Revisit with legal/product before public launch.

| # | Decision | MVP resolution |
|---|----------|----------------|
| 1 | Launch social channels + metrics | **Instagram, TikTok, YouTube**. Store raw provider metrics; UI labels source + last-refreshed; never invent missing fields. |
| 2 | Payment provider | **Paystack** for Nigerian collections/payouts, behind a provider interface. Woosh owns the internal ledger and payment states. |
| 3 | Brand funding timing | Brands **fund before selection** (commitment at accept). Briefs can draft/publish without full funding; accepting a creator requires funded capacity for that obligation. |
| 4 | Platform fee model | **0% Woosh platform fee** for brands, agencies and creators. The agreed rate is funded and paid out. Paystack processing fees are separate. |
| 5 | Age/gender search | Optional on creator profile. **Age band** and gender searchable only when creator opts in to discovery visibility. Exact DOB never exposed to brands. |
| 6 | Direct contact before accept | **Masked** until selection/acceptance. Messaging stays in-platform. |
| 7 | Binding on accept | Accept locks structured commercial terms (rate, rights, deliverables). **No separate e-sign in MVP** (Phase 2). |
| 8 | Rate/payment approvers | Org owners and finance users approve payments. Brand/agency managers may accept rates within configured thresholds; above threshold requires elevated approval. |
| 9 | MVP currencies | **NGN only** for quoting, wallet funding and creator settlement. USD display/settlement remains Phase 2 so the product never promises a rail that is not operationally verified. |
| 10 | Brief moderation | Verified organisations: briefs go live after automated checks (prohibited categories, rate anomalies flagged). Unverified or first-campaign orgs: **admin review queue** before visibility. |

## Explicit non-goals locked with these decisions

- No proprietary wallet product in MVP
- No microservice split
- No guaranteed ROI claims in product copy or analytics
