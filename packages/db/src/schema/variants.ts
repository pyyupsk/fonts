import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { families } from "./families";

export const variants = sqliteTable(
  "variants",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id),
    style: text("style").notNull(),
    weight: integer("weight").notNull(),
    postScriptName: text("post_script_name").notNull(),
  },
  (table) => [
    index("variants_family_idx").on(table.familyId),
    unique("variants_family_style_weight_unique").on(
      table.familyId,
      table.style,
      table.weight,
    ),
  ],
);
