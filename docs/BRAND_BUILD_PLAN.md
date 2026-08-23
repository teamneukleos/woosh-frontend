# Brand-faithful rebuild plan

Source: Woosh Brand Guidelines (19pp) + font packs:
- Primary display: **Pro Dunex** (`pro-dunex-52272284.zip` — Regular OTF/TTF only)
- Secondary UI: **Metropolis** from `avenir-similar-fonts.zip` (OFL; closest Avenir stand-in). Montserrat kept as fallback only if Metropolis fails a glyph/weight need.

Page previews extracted to `docs/brand-previews/` for reference (gitignored recommended if large).

---

## What the guidelines actually demand

| Pillar | Spec |
|--------|------|
| Promise | Motion at the speed of culture |
| Personality | Swift · Modern · Efficient · Tech driven · Professional |
| Logo | Stylized motion **W** + italic/outline **WOOSH** wordmark; icon outline / horizontal / app icon variants |
| Colour | `#000000` Black · `#161616` Dull · `#091B68` Navy · `#003AF4` Electric · `#0DE3AF` Teal · `#BCBCBC` Soft grey · `#FFFFFF` White |
| Type | **Pro Dunex** = speed display / hero / brand moments · **Avenir-family** = UI, body, labels |
| Pattern | Dense grid of outlined W icons on navy→electric gradient; selective white/cyan highlights forming a larger W |
| Applications | Splash (W alone on blue→navy gradient), OOH (huge motion type + teal streak), device mockups, dark premium tech |

Current product gaps: Nunito Sans, text-dot logo, light “SaaS mist” app chrome, photo-first marketing that doesn’t use the W pattern / motion language.

---

## Font roles (locked)

1. **`--font-woosh-display` = Pro Dunex** — hero / marketing display.
2. **`--font-woosh-sans` = Metropolis** — Avenir secondary stand-in (OFL). Confirmed by product owner.
3. Official wordmark PNG supplied — wired as light/dark assets under `public/brand/`.

Nunito Sans removed.

---

## Asset pipeline (B0)

1. Unzip fonts into `public/fonts/` (or `src/fonts/` with `next/font/local`):
   - `ProDunex-Regular.otf`
   - Metropolis: Thin→Black needed subset (at least Regular, Medium, SemiBold, Bold + italics for wordmark moments if needed)
2. Extract / recreate logo set into `public/brand/`:
   - `w-icon.svg` (solid + outline)
   - `wordmark-horizontal.svg` (dark + light)
   - `app-icon.svg`
   - Prefer official vectors if you have them; otherwise trace from guideline pages (`page-05`–`07`, splash `page-12`)
3. Build CSS brand pattern utility: SVG/`mask-image` W grid + navy→electric radial (from Brand Pattern page) — no photo required for hero atmosphere.
4. Update [`src/lib/brand.ts`](src/lib/brand.ts) + [`src/app/globals.css`](src/app/globals.css) tokens; document in `docs/BRAND.md`.
5. Replace [`Logo`](src/components/ui/logo.tsx) to use real mark (icon + wordmark), not “Woosh + dot”.

---

## Visual system (B1)

**Marketing surfaces (home, login/register left rail, claim):**
- Default field: **navy / black**, not light grey
- Full-bleed motion plane: brand pattern + electric/teal light streaks (guideline OOH/splash), optional creator photo as secondary layer only
- Brand first: real **W + WOOSH** in Pro Dunex — must pass “remove nav, still Woosh” test
- One headline (tagline or “Engage with Speed” energy), one support line, one CTA group
- Motion: 2–3 intentional (pattern drift, streak reveal, rise) — no generic purple glow blobs

**App surfaces:**
- Keep usable light chrome for density, but brand it: Metropolis, real logo in shell, electric blue actions, teal success, navy headers
- Optional subtle W watermark on empty states only

---

## Build phases

### Phase B0 — Brand foundation (blocking)
Fonts + logo + pattern + tokens + Logo component + favicon/app icon.

### Phase B1 — Marketing rebuild
Rewrite homepage to guideline language (pattern hero, Pro Dunex display, Metropolis body). Align auth + claim split layouts. Drop Nunito.

### Phase B2 — Shell & kit pass
AppShell logo, typography scale, button/type hierarchy using Metropolis; display font reserved for marketing / rare page titles.

### Phase B3 — Signature moments
Splash-style loading (W on gradient), empty states, email stub HTML later, OG image using pattern + wordmark.

### Phase B4 — QA
Contrast (white on navy), Pro Dunex Regular-only hierarchy, mobile 390px, font license notes (Metropolis OFL; confirm Pro Dunex license for web embedding).

---

## Explicit non-goals (this plan)
- Not redesigning every app table again (already F0–F7)
- Not inventing a second brand palette
- Not using Montserrat as primary secondary if Metropolis loads cleanly
- Not shipping photo-only heroes that erase the W identity

---

## Open input needed from you
1. **Official logo SVG/PDF exports** if you have them (faster + sharper than tracing).  
2. Confirm **Pro Dunex web embedding license** is OK for production.  
3. Prefer **Metropolis** (recommended) vs Montserrat as the Avenir stand-in — defaulting to Metropolis unless you say otherwise.

---

## Suggested first execution order
B0 → B1 homepage → auth/claim → AppShell logo/type → splash loader → docs.
