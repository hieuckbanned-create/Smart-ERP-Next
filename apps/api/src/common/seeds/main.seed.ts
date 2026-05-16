import { db } from '@smart-erp/database';
import { 
  tenants, users, products, warehouses, crmPipelines, crmStages, 
  financeBudgets, tmsVehicles 
} from '@smart-erp/database/schema';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting Golden Seed...');

  // 1. Create Tenant
  const [tenant] = await db.insert(tenants).values({
    name: 'Smart ERP Next Demo',
    slug: 'demo-erp',
  }).returning();

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const [admin] = await db.insert(users).values({
    tenantId: tenant.id,
    email: 'admin@demo.vn',
    name: 'Quản trị viên',
    passwordHash: hashedPassword,
    role: 'admin',
  }).returning();

  // 3. Create Warehouse
  const [wh] = await db.insert(warehouses).values({
    tenantId: tenant.id,
    name: 'Kho Tổng Hà Nội',
    code: 'WH-HN-01',
    address: 'Cầu Giấy, Hà Nội',
  }).returning();

  // 4. Create Products
  await db.insert(products).values([
    {
      tenantId: tenant.id,
      name: 'iPhone 15 Pro Max',
      sku: 'IP15-PM-256',
      price: '32000000',
      cost: '28000000',
    },
    {
      tenantId: tenant.id,
      name: 'MacBook M3 Pro',
      sku: 'MBP-M3-14',
      price: '45000000',
      cost: '40000000',
    }
  ]);

  // 5. Create CRM Pipeline
  const [pipe] = await db.insert(crmPipelines).values({
    tenantId: tenant.id,
    name: 'Quy trình Bán lẻ',
    isDefault: 1,
  }).returning();

  await db.insert(crmStages).values([
    { tenantId: tenant.id, pipelineId: pipe.id, name: 'Tiềm năng', sequence: 1, probability: 10 },
    { tenantId: tenant.id, pipelineId: pipe.id, name: 'Tư vấn', sequence: 2, probability: 30 },
    { tenantId: tenant.id, pipelineId: pipe.id, name: 'Đề xuất', sequence: 3, probability: 60 },
    { tenantId: tenant.id, pipelineId: pipe.id, name: 'Chốt Deal', sequence: 4, probability: 100 },
  ]);

  // 6. Create Finance Budget
  await db.insert(financeBudgets).values({
    tenantId: tenant.id,
    name: 'Ngân sách Vận hành 2026',
    fiscalYear: 2026,
    totalAmount: '5000000000',
    currency: 'VND',
    status: 'approved',
    managerId: admin.id,
  });

  // 7. Create TMS Vehicle
  await db.insert(tmsVehicles).values({
    tenantId: tenant.id,
    plateNumber: '29A-888.88',
    model: 'Hino 500',
    type: 'Truck 5T',
    capacity: '5000',
  });

  console.log('✅ Golden Seed completed! Data is ready for end-users.');
  console.log('📧 Login: admin@demo.vn / admin123');
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
