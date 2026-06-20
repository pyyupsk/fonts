import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { families } from "./families";
import { subsets } from "./subsets";

export const familySubsets = sqliteTable(
  "family_subsets",
  {
    familyId: text("family_id")
      .notNull()
      .references(() => families.id),
    subsetId: text("subset_id")
      .notNull()
      .references(() => subsets.id),
  },
  (table) => [
    primaryKey({ columns: [table.familyId, table.subsetId] }),
    index("family_subsets_subset_idx").on(table.subsetId),
  ],
);
