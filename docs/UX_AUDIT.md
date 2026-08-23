# Product UX audit — corrections (2026-08-08)

## What was wrong

1. **Categories were free-text** (comma-typed) on profile, settings, and prospect forms. That produces dirty, unsearchable data.
2. **Creators were asked to type follower counts** when “connecting” socials. Metrics become static lies. PRD requires OAuth-connected channels with source + freshness labels.
3. **Settings duplicated profile + social connect** instead of a single Profile surface.
4. **Industry** on brand/org forms was free-text.
5. **Claim flow** copied prospect follower estimates into `manual_unverified` ACTIVE snapshots — looked like verified data.

## What we fixed

| Area | Fix |
|------|-----|
| Taxonomy | [`src/lib/taxonomy.ts`](../src/lib/taxonomy.ts) — controlled categories, industries, languages, channels |
| Pickers | [`CategoryPicker`](../src/components/ui/taxonomy-pickers.tsx) / `LanguagePicker` multi-select |
| Social | [`SocialConnections`](../src/components/creator/social-connections.tsx) — Connect/Reconnect only; **no follower input** |
| Domain | `connectSocialChannel` / `attachClaimedChannel` — PENDING until OAuth; no creator-typed metrics |
| Profile | Category + language pickers; connected accounts panel |
| Settings | Org/brand only; creators sent to Profile |
| Discovery | Category **select** filter; prospect add uses category picker; ops estimate optional & labelled |
| Onboarding / brand | Industry **select** |
| Admin seed | Categories must match taxonomy |

## Still required (not fakeable in UI)

- Real **OAuth** for Instagram / TikTok / YouTube + metric refresh jobs
- Until keys exist, Connect creates **PENDING** accounts; UI says metrics sync after provider auth
- Never display `manual_unverified` snapshots as live follower counts on creator cards

## Rule going forward

- Controlled fields → select / multi-select from taxonomy  
- Social metrics → provider only  
- Ops estimates on **prospects only**, always labelled unverified  
