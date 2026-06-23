# fonts

Self-hosted, editorial alternative to Google Fonts — serves ~2015 open-license font families (OFL/Apache/UFL) with metadata, previews, and CDN-delivered files via Cloudflare D1 + R2.

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
