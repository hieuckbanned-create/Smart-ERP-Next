import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id").references(
    (): AnyPgColumn => productCategories.id,
    { onDelete: "set null" },
  ),
  level: integer("level").notNull().default(0),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
