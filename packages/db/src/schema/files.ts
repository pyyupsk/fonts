import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { variants } from "./variants";

export const files = sqliteTable(
  "files",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id),
    format: text("format").notNull(),
    r2Key: text("r2_key").notNull(),
    fileSize: integer("file_size").notNull(),
    checksumSha256: text("checksum_sha256").notNull(),
    sourceChecksumSha256: text("source_checksum_sha256").notNull(),
  },
  (table) => [index("files_variant_idx").on(table.variantId)],
);
