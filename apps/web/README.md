# @fonts/web

Astro (static output) + React islands, deployed via `@astrojs/cloudflare`. Calls `@fonts/api` through a server-only `API_BASE` env var (validated via `astro:env`).

Never imports `@fonts/db` directly — all data access goes through the API.

## Layout

- `src/pages/` — Astro routes.
- `src/components/` — Astro/React components (React islands for interactivity).
- `src/layouts/` — page layouts.
- `src/lib/` — shared helpers, API client.
- `src/styles/` — Tailwind CSS v4.

## Commands

```bash
bun run dev        # astro dev
bun run build      # astro check && astro build
bun run preview    # wrangler dev
bun run deploy     # wrangler deploy
bun run test       # bun test
bun run lint       # eslint .
bun run typecheck  # astro check
```

No top-level dev server links this to `apps/api` automatically — point `API_BASE` at a running `apps/api` (`dev:local`) for a full local loop, or it defaults to the deployed/remote API.
