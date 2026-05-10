-- Smart ERP Next — Initial Schema Migration
-- Generated: 2026-05-10

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tenants ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "tenants" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT NOT NULL,
  "slug"       TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"         TEXT NOT NULL UNIQUE,
  "name"          TEXT,
  "password_hash" TEXT,
  "role"          TEXT NOT NULL DEFAULT 'user',
  "tenant_id"     UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "created_at"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Product Categories ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_categories" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "parent_id"   UUID REFERENCES "product_categories"("id") ON DELETE SET NULL,
  "level"       INTEGER NOT NULL DEFAULT 0,
  "sort_order"  INTEGER DEFAULT 0,
  "is_active"   BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "products" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name"        TEXT NOT NULL,
  "sku"         TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category"    TEXT,
  "unit"        TEXT DEFAULT 'piece',
  "price"       NUMERIC(18,2) NOT NULL,
  "cost"        NUMERIC(18,2) DEFAULT 0,
  "stock"       INTEGER NOT NULL DEFAULT 0,
  "min_stock"   INTEGER DEFAULT 0,
  "is_active"   BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "products_tenant_idx"   ON "products"("tenant_id");
CREATE INDEX IF NOT EXISTS "products_sku_idx"      ON "products"("sku");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX IF NOT EXISTS "products_active_idx"   ON "products"("is_active");

-- ── Inventory Transactions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"      UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "product_id"     UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "type"           TEXT NOT NULL,
  "quantity"       INTEGER NOT NULL,
  "previous_stock" INTEGER NOT NULL,
  "new_stock"      INTEGER NOT NULL,
  "reference"      TEXT,
  "notes"          TEXT,
  "created_at"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by"     UUID
);

-- ── Customers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "customers" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"        UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"             TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "phone"            TEXT,
  "email"            TEXT,
  "address"          TEXT,
  "ward"             TEXT,
  "district"         TEXT,
  "province"         TEXT,
  "tax_code"         TEXT,
  "contact_person"   TEXT,
  "customer_group"   TEXT DEFAULT 'retail',
  "debt_limit"       NUMERIC(18,2) DEFAULT 0,
  "current_debt"     NUMERIC(18,2) DEFAULT 0,
  "total_purchased"  NUMERIC(18,2) DEFAULT 0,
  "loyalty_points"   NUMERIC(10,0) DEFAULT 0,
  "notes"            TEXT,
  "is_active"        BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "customers_tenant_idx" ON "customers"("tenant_id");
CREATE INDEX IF NOT EXISTS "customers_code_idx"   ON "customers"("code");
CREATE INDEX IF NOT EXISTS "customers_phone_idx"  ON "customers"("phone");

-- ── Suppliers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "suppliers" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"           UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"                TEXT NOT NULL,
  "name"                TEXT NOT NULL,
  "phone"               TEXT,
  "email"               TEXT,
  "address"             TEXT,
  "ward"                TEXT,
  "district"            TEXT,
  "province"            TEXT,
  "tax_code"            TEXT,
  "contact_person"      TEXT,
  "bank_account"        TEXT,
  "bank_name"           TEXT,
  "payment_term_days"   NUMERIC(5,0) DEFAULT 30,
  "current_debt"        NUMERIC(18,2) DEFAULT 0,
  "total_purchased"     NUMERIC(18,2) DEFAULT 0,
  "notes"               TEXT,
  "is_active"           BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "suppliers_tenant_idx" ON "suppliers"("tenant_id");
CREATE INDEX IF NOT EXISTS "suppliers_code_idx"   ON "suppliers"("code");

-- ── Warehouses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "warehouses" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "address"     TEXT,
  "manager_id"  UUID,
  "is_default"  BOOLEAN NOT NULL DEFAULT FALSE,
  "is_active"   BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "warehouses_tenant_idx" ON "warehouses"("tenant_id");

-- ── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "orders" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"        UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"             TEXT NOT NULL,
  "customer_id"      UUID REFERENCES "customers"("id") ON DELETE SET NULL,
  "warehouse_id"     UUID REFERENCES "warehouses"("id") ON DELETE SET NULL,
  "assigned_to"      UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status"           TEXT NOT NULL DEFAULT 'draft',
  "channel"          TEXT NOT NULL DEFAULT 'pos',
  "subtotal"         NUMERIC(18,2) NOT NULL DEFAULT 0,
  "discount_amount"  NUMERIC(18,2) DEFAULT 0,
  "discount_percent" NUMERIC(5,2) DEFAULT 0,
  "tax_amount"       NUMERIC(18,2) DEFAULT 0,
  "shipping_fee"     NUMERIC(18,2) DEFAULT 0,
  "total"            NUMERIC(18,2) NOT NULL DEFAULT 0,
  "paid_amount"      NUMERIC(18,2) DEFAULT 0,
  "debt_amount"      NUMERIC(18,2) DEFAULT 0,
  "payment_status"   TEXT NOT NULL DEFAULT 'unpaid',
  "payment_method"   TEXT,
  "shipping_address" TEXT,
  "shipping_provider" TEXT,
  "tracking_code"    TEXT,
  "notes"            TEXT,
  "tags"             TEXT,
  "cancel_reason"    TEXT,
  "confirmed_at"     TIMESTAMP,
  "shipped_at"       TIMESTAMP,
  "delivered_at"     TIMESTAMP,
  "cancelled_at"     TIMESTAMP,
  "created_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "orders_tenant_idx"     ON "orders"("tenant_id");
CREATE INDEX IF NOT EXISTS "orders_code_idx"       ON "orders"("code");
CREATE INDEX IF NOT EXISTS "orders_customer_idx"   ON "orders"("customer_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx"     ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");

-- ── Order Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_items" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"         UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id"       UUID NOT NULL,
  "product_name"     TEXT NOT NULL,
  "product_sku"      TEXT NOT NULL,
  "unit"             TEXT DEFAULT 'piece',
  "quantity"         INTEGER NOT NULL,
  "unit_price"       NUMERIC(18,2) NOT NULL,
  "discount_amount"  NUMERIC(18,2) DEFAULT 0,
  "discount_percent" NUMERIC(5,2) DEFAULT 0,
  "tax_rate"         NUMERIC(5,2) DEFAULT 0,
  "line_total"       NUMERIC(18,2) NOT NULL,
  "notes"            TEXT,
  "serial_numbers"   TEXT,
  "batch_number"     TEXT,
  "expiry_date"      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "order_items_order_idx"   ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_idx" ON "order_items"("product_id");

-- ── Purchase Orders ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_orders" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"        UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"             TEXT NOT NULL,
  "supplier_id"      UUID REFERENCES "suppliers"("id") ON DELETE SET NULL,
  "warehouse_id"     UUID REFERENCES "warehouses"("id") ON DELETE SET NULL,
  "created_by"       UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status"           TEXT NOT NULL DEFAULT 'draft',
  "subtotal"         NUMERIC(18,2) NOT NULL DEFAULT 0,
  "discount_amount"  NUMERIC(18,2) DEFAULT 0,
  "tax_amount"       NUMERIC(18,2) DEFAULT 0,
  "total"            NUMERIC(18,2) NOT NULL DEFAULT 0,
  "paid_amount"      NUMERIC(18,2) DEFAULT 0,
  "payment_status"   TEXT NOT NULL DEFAULT 'unpaid',
  "payment_method"   TEXT,
  "expected_date"    TIMESTAMP,
  "received_at"      TIMESTAMP,
  "notes"            TEXT,
  "created_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "po_tenant_idx"   ON "purchase_orders"("tenant_id");
CREATE INDEX IF NOT EXISTS "po_code_idx"     ON "purchase_orders"("code");
CREATE INDEX IF NOT EXISTS "po_supplier_idx" ON "purchase_orders"("supplier_id");
CREATE INDEX IF NOT EXISTS "po_status_idx"   ON "purchase_orders"("status");

-- ── Purchase Order Items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "purchase_order_id" UUID NOT NULL REFERENCES "purchase_orders"("id") ON DELETE CASCADE,
  "product_id"        UUID NOT NULL,
  "product_name"      TEXT NOT NULL,
  "product_sku"       TEXT NOT NULL,
  "unit"              TEXT DEFAULT 'piece',
  "ordered_qty"       INTEGER NOT NULL,
  "received_qty"      INTEGER NOT NULL DEFAULT 0,
  "unit_cost"         NUMERIC(18,2) NOT NULL,
  "tax_rate"          NUMERIC(5,2) DEFAULT 0,
  "line_total"        NUMERIC(18,2) NOT NULL,
  "batch_number"      TEXT,
  "expiry_date"       TIMESTAMP,
  "notes"             TEXT
);
CREATE INDEX IF NOT EXISTS "po_items_po_idx"      ON "purchase_order_items"("purchase_order_id");
CREATE INDEX IF NOT EXISTS "po_items_product_idx" ON "purchase_order_items"("product_id");

-- ── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "payments" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id"       UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "code"            TEXT NOT NULL,
  "type"            TEXT NOT NULL,
  "reference_type"  TEXT,
  "reference_id"    UUID,
  "party_type"      TEXT,
  "party_id"        UUID,
  "party_name"      TEXT,
  "amount"          NUMERIC(18,2) NOT NULL,
  "method"          TEXT NOT NULL DEFAULT 'cash',
  "bank_account"    TEXT,
  "transaction_ref" TEXT,
  "status"          TEXT NOT NULL DEFAULT 'completed',
  "notes"           TEXT,
  "created_by"      UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "paid_at"         TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at"      TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "payments_tenant_idx"    ON "payments"("tenant_id");
CREATE INDEX IF NOT EXISTS "payments_code_idx"      ON "payments"("code");
CREATE INDEX IF NOT EXISTS "payments_reference_idx" ON "payments"("reference_id");
CREATE INDEX IF NOT EXISTS "payments_paid_at_idx"   ON "payments"("paid_at");
