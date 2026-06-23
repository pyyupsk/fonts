# @fonts/api

Hono API, deployed as a Cloudflare Worker. Reads from D1 via Drizzle (`@fonts/db`).

## Layout

- `src/index.ts` — entrypoint, mounts sub-`Hono` apps under `/api/*`, exports `AppType`.
- `src/bindings.ts` — Hono `Bindings` typed against `wrangler.toml`/`wrangler dev` bindings (D1, R2, public base URL).
- `src/routes/` — route handlers (one file per resource, e.g. `fonts.ts`).
- `src/lib/` — shared helpers.

Env comes through Hono's `Bindings`, never `process.env` directly.

## Commands

```bash
bun run dev          # wrangler dev --remote
bun run dev:local    # wrangler dev --persist-to ../../.wrangler-state
bun run deploy       # wrangler deploy
bun run test         # bun test
bun run lint         # eslint .
bun run typecheck    # tsc --noEmit
```
