# Smart ERP Next v0.1.0

## Quick Start
```bash
docker compose up -d
# Web: http://localhost:3457
# Login: admin@smarterp.vn / admin123
```

## Modules
- **POS** — Bán hàng tại quầy với 6 phương thức thanh toán
- **Orders** — Quản lý đơn hàng, xuất hóa đơn điện tử
- **Products** — Quản lý sản phẩm, tồn kho, nhập/xuất
- **Customers** — Quản lý khách hàng, công nợ
- **Suppliers** — Quản lý nhà cung cấp
- **Purchasing** — Đơn mua hàng, nhập kho
- **Inventory** — Kiểm kho, chuyển kho, cảnh báo tồn thấp
- **Payments** — Thu/chi, đối soát
- **Warehouses** — Đa kho hàng
- **CRM** — Quản lý lead, pipeline bán hàng
- **HR** — Nhân sự, chấm công, tính lương, KPI
- **Accounting** — Kế toán, danh mục tài khoản
- **Reports** — Báo cáo doanh thu, lợi nhuận, dự báo
- **E-Invoice** — Hóa đơn điện tử (VNPT)
- **Settings** — Cấu hình hệ thống, ecommerce, Xero

## Tech Stack
- **Backend**: NestJS + Drizzle ORM + PostgreSQL
- **Frontend**: Next.js 15 + Tailwind CSS + lucide-react
- **Auth**: JWT + bcrypt
- **i18n**: react-i18next (vi/en)
- **Deploy**: Docker, GitHub Container Registry

## Changes since dev
- Zero-config Docker: `docker compose up -d` works without .env
- Auto-seed demo data (6 products, 4 customers, 3 suppliers, 3 orders, CRM leads, attendance records, etc.)
- UI đồng bộ: tất cả pages dùng PageHeader + p-6 + lucide-react + dark mode
- E2E tests: 67 page audit + 19 interaction/CRUD tests
- Loại bỏ ~7,000 dòng code chết (10 API modules, 4 frontend pages, desktop app, AI Forecast Python, @smart-erp/ui, @smart-erp/i18n)
