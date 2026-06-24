# fonts

> A self-hosted, open-license type catalog. Browse, compare, and grab the file.

Self-hosted, editorial alternative to Google Fonts — serves ~2015 open-license font families (OFL/Apache/UFL) with metadata, previews, and CDN-delivered files via Cloudflare D1 + R2.

## Why

Not the biggest catalog (Google) or the slickest npm packaging (Fontsource) — built on **taste-as-feature**: the site's own design is the proof of curation quality.

- **Editorial discovery** — live `@font-face` previews, variable-axis sliders, side-by-side compare.
- **Self-hosted, zero tracking** — files direct from the CDN (R2), immutable 1-year cache.
- **Grab-the-file** — per-variant `.woff2` + copy-paste `@font-face` on every family page.
- **Public REST API** — `/api/fonts`, `/full`, `/:family`; CORS-open, no auth.

## Layout

Bun workspaces + Turborepo monorepo.

- [`apps/api`](apps/api) — Hono API, deployed as a Cloudflare Worker.
- [`apps/web`](apps/web) — Astro + React islands, deployed via `@astrojs/cloudflare`.
- [`packages/db`](packages/db) — Drizzle ORM schema for the D1 database.
- [`packages/ingest`](packages/ingest) — CLI that parses `packages/fonts` and seeds D1 + R2.
- [`packages/fonts`](packages/fonts) — vendored upstream Google Fonts data (read-only).
- [`packages/tsconfig`](packages/tsconfig) — shared base tsconfig.

## Data flow

`packages/fonts` → `packages/ingest` → D1 (`packages/db`) → `apps/api` → `apps/web`.

## Commands

```bash
bun install   # install deps
bun run build # turbo run build (all packages)
bun run dev   # turbo run dev (all packages, persistent)
bun run lint  # turbo run lint
bun run test  # turbo run test
```

Package manager is `bun@1.3.14` — see `packageManager` in `package.json`. Never use npm/yarn/pnpm.
