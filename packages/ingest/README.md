# @fonts/ingest

CLI that walks `packages/fonts/{ofl,apache,ufl}/<family>`, parses each family's `METADATA.pb`/font files, converts/uploads font files to R2, and emits D1 SQL statements to seed the database.

## Layout

- `src/cli/ingest.ts` — entrypoint (citty CLI).
- `src/parse/` — `METADATA.pb` parsing (`parse-metadata.ts`) + row mapping (`map-to-rows.ts`) + per-family orchestration (`ingest-family.ts`).
- `src/upload/` — font file conversion + R2 upload (`convert-and-upload.ts`), credentials, D1 client.
- `src/sql/` — builds D1 SQL statements (`build-statements.ts`).

## Commands

```bash
bun run ingest all [--limit N]            # ingest every family under packages/fonts
bun run ingest one <license> <familyDir>  # ingest a single family (license: ofl | apache | ufl)
bun run test       # bun test
bun run lint       # eslint .
bun run typecheck  # tsc --noEmit
```
