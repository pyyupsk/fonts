import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { licenses } from "./licenses";

export const families = sqliteTable(
  "families",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    designer: text("designer").notNull(),
    category: text("category").notNull(),
    license: text("license")
      .notNull()
      .references(() => licenses.id),
    isNoto: integer("is_noto", { mode: "boolean" }).notNull().default(false),
    dateAdded: text("date_added").notNull(),
    sourceRepositoryUrl: text("source_repository_url").notNull(),
  },
  (table) => [
    index("families_category_idx").on(table.category),
    index("families_license_idx").on(table.license),
  ],
);
