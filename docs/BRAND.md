# Woosh brand — product application

## Type
| Role | Face | Usage |
|------|------|--------|
| Display | **Pro Dunex** | Hero / marketing brand moments (Regular only) |
| UI / body | **Metropolis** (Avenir stand-in) | App chrome, labels, marketing body |

Self-hosted via `src/lib/fonts.ts` → `--font-woosh-display` / `--font-woosh-sans`.

## Logo
| Asset | Path |
|-------|------|
| Wordmark light | `/public/brand/woosh-wordmark-light.png` |
| Wordmark dark | `/public/brand/woosh-wordmark-dark.png` |
| W mark | `/public/brand/woosh-w-*.png` |
| App icon | `/public/brand/app-icon.png` |
| Pattern tile | `/public/brand/pattern-w.svg` |

Use `<Logo light />` on navy/black; default dark wordmark on light UI.

## Colour
Electric `#003AF4` · Navy `#091B68` · Teal `#0DE3AF` · Black / Dull / Soft grey / White — see `src/lib/brand.ts` and `globals.css`.

## Pattern
`.woosh-brand-pattern` — navy field + electric/teal radials + W grid. Prefer this over decorative glow blobs on marketing surfaces.
