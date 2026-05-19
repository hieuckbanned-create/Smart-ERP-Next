import { pgTable, uuid, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { products } from './products';

export const mrpForecasts = pgTable(
  'mrp_forecasts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    forecast_date: date('forecast_date').notNull(),
    forecasted_demand: integer('forecasted_demand').default(0),
    sales_order_demand: integer('sales_order_demand').default(0),
    net_requirement: integer('net_requirement').default(0),
    suggested_production: integer('suggested_production').default(0),
    raw_material_gap: integer('raw_material_gap').default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }
);
