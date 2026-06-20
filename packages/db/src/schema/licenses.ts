import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const licenses = sqliteTable("licenses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
});
