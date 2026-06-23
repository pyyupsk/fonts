# @fonts/db

Drizzle ORM schema for the D1 database. Each schema file is its own subpath export — no barrel file.

## Tables

`families`, `variants`, `files`, `subsets`, `family-subsets`, `licenses` — see `src/schema/*.ts`.

```ts
import { families } from "@fonts/db/schema/families";
```

Only `apps/api` and `packages/ingest` touch the database directly.

## Commands

```bash
bun run db:generate        # drizzle-kit generate (after editing src/schema/*)
bun run db:migrate         # apply migrations to remote D1
bun run db:migrate:local   # apply migrations to local D1 (--persist-to ../../.wrangler-state)
bun run db:studio          # drizzle-kit studio
bun run test               # bun test
bun run lint               # eslint .
bun run typecheck          # tsc --noEmit
```

`drizzle.config.ts` auto-discovers the local Miniflare D1 sqlite file under `.wrangler-state/v3/d1/miniflare-D1DatabaseObject` — run `db:migrate:local` (via `apps/api` or here) at least once before `db:studio` locally.
