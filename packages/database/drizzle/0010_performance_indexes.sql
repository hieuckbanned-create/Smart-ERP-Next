-- Performance Indexes for new modules (HR, Loyalty, Fixed Assets, Projects)

-- HR/Payroll indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant_status ON employees(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_payrolls_tenant_month_year ON payrolls(tenant_id, year, month);
CREATE INDEX IF NOT EXISTS idx_payrolls_status ON payrolls(tenant_id, status);

-- Loyalty indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_tenant_points ON loyalty_cards(tenant_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_tier ON loyalty_cards(tenant_id, tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_card_date ON loyalty_transactions(loyalty_card_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON loyalty_rewards(tenant_id, points_required);

-- Fixed Assets indexes
CREATE INDEX IF NOT EXISTS idx_fixed_assets_tenant_category ON fixed_assets(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_purchase_date ON fixed_assets(tenant_id, purchase_date);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_tenant_priority ON projects(tenant_id, priority);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(tenant_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_status ON project_tasks(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due ON project_milestones(project_id, due_date);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_date ON project_time_entries(tenant_id, entry_date DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status_date ON orders(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_tenant_date ON inventory_transactions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_date ON payments(tenant_id, paid_at DESC);
