import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const subsets = sqliteTable("subsets", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});
