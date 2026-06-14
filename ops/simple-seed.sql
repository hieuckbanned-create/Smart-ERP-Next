SET client_min_messages TO warning;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'demo-erp') THEN
    INSERT INTO tenants (id, name, slug)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Smart ERP Next Demo', 'demo-erp');
  END IF;
END $$;

INSERT INTO product_categories (id, tenant_id, name, slug, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Điện tử', 'electronics', true
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE slug = 'electronics' AND tenant_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO product_categories (id, tenant_id, name, slug, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Phụ kiện', 'accessories', true
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE slug = 'accessories' AND tenant_id = '11111111-1111-1111-1111-111111111111');

DO $$
DECLARE tid uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  INSERT INTO users (id, tenant_id, email, name, password_hash, role, is_active)
  SELECT gen_random_uuid(), tid, 'admin@demo.smarterp.vn', 'Demo Admin User',
    '$2b$10$MZjkR034ghQ/wwrQp3w4sOwBovADjnN3wHjXCj.szNi6VjKqL/6kO', 'admin', true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.smarterp.vn');

  INSERT INTO users (id, tenant_id, email, name, password_hash, role, is_active)
  SELECT gen_random_uuid(), tid, 'admin@demo.vn', 'Default Admin',
    '$2b$10$MZjkR034ghQ/wwrQp3w4sOwBovADjnN3wHjXCj.szNi6VjKqL/6kO', 'admin', true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.vn');

  INSERT INTO users (id, tenant_id, email, name, password_hash, role, is_active)
  SELECT gen_random_uuid(), tid, 'manager@demo.vn', 'Nguyễn Văn Quản Lý',
    '$2b$10$MZjkR034ghQ/wwrQp3w4sOwBovADjnN3wHjXCj.szNi6VjKqL/6kO', 'manager', true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@demo.vn');

  INSERT INTO users (id, tenant_id, email, name, password_hash, role, is_active)
  SELECT gen_random_uuid(), tid, 'staff@demo.vn', 'Trần Thị Nhân Viên',
    '$2b$10$MZjkR034ghQ/wwrQp3w4sOwBovADjnN3wHjXCj.szNi6VjKqL/6kO', 'user', true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@demo.vn');
END $$;

INSERT INTO warehouses (id, tenant_id, name, code, is_default)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kho Tổng Hà Nội', 'WH-HN-01', true
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE code = 'WH-HN-01');

INSERT INTO warehouses (id, tenant_id, name, code)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kho TP. Hồ Chí Minh', 'WH-HCM-01'
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE code = 'WH-HCM-01');

INSERT INTO products (id, tenant_id, name, sku, price, cost, stock, min_stock, reorder_quantity, lead_time_days, safety_stock, is_active)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'iPhone 15 Pro Max 256GB', 'IP15-PM-256', 32000000, 28000000, 150, 20, 30, 14, 10, true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MacBook Pro M3 14 inch', 'MBP-M3-14', 45000000, 40000000, 80, 10, 15, 21, 5, true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'AirPods Pro 2', 'APP-PRO-2', 5990000, 4500000, 300, 50, 40, 7, 25, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO customers (id, tenant_id, code, name, email, phone, address, tax_code, contact_person, customer_group, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'CUS-001', 'Công ty TNHH ABC', 'contact@abc.com.vn', '024-3888-0001', 'Ba Đình, Hà Nội', '0101234567', 'Ông A', 'VIP', true
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE code = 'CUS-001');

INSERT INTO customers (id, tenant_id, code, name, email, phone, address, tax_code, contact_person, customer_group, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'CUS-002', 'Công ty Cổ phần XYZ', 'info@xyz.vn', '028-3999-0002', 'Quận 3, TP.HCM', '0309876543', 'Bà B', 'Regular', true
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE code = 'CUS-002');

INSERT INTO suppliers (id, tenant_id, code, name, email, phone, address, tax_code, contact_person, payment_term_days, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SUP-001', 'Apple Việt Nam', 'supplier@apple.com.vn', '024-3777-0001', 'Hoàn Kiếm, Hà Nội', '0101234567', 'Mr. Tim', 30, true
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE code = 'SUP-001');

INSERT INTO suppliers (id, tenant_id, code, name, email, phone, address, tax_code, contact_person, payment_term_days, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SUP-002', 'Samsung Việt Nam', 'b2b@samsung.com.vn', '028-3666-0002', 'Bình Thạnh, TP.HCM', '0309876543', 'Ms. Kim', 45, true
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE code = 'SUP-002');

INSERT INTO employees (id, tenant_id, code, name, email, phone, position, salary, is_active)
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'EMP-001', 'Quản trị viên', 'admin@demo.vn', '0901-000-001', 'Quản trị hệ thống', '50000000', true
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE code = 'EMP-001');
