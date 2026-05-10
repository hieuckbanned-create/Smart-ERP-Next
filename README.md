# Smart ERP Next

Hệ thống quản trị doanh nghiệp thế hệ mới — vượt trội hơn ERPNext, Odoo, KiotViet, Nhanhvn, MISA về tốc độ, trải nghiệm và khả năng mở rộng.

## Điểm khác biệt

| Tính năng | Smart ERP Next | KiotViet | Nhanhvn | MISA | ERPNext |
|-----------|---------------|----------|---------|------|---------|
| Native đa nền tảng | ✅ Web + Mobile + Desktop | Web only | Web only | Web only | Web only |
| Offline-first + CRDT sync | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mã nguồn mở | ✅ | ❌ | ❌ | ❌ | ✅ |
| Bản địa hóa tiếng Việt | ✅ Built-in | ✅ | ✅ | ✅ | Partial |
| Multi-tenant | ✅ | ❌ | ❌ | ❌ | ✅ |
| Real-time WebSocket | ✅ | Partial | Partial | ❌ | ❌ |
| Monorepo shared packages | ✅ | ❌ | ❌ | ❌ | ❌ |

## Tech Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Monorepo | pnpm + Turborepo |
| Backend API | NestJS 10, JWT, bcrypt, Socket.IO |
| Database | PostgreSQL 14+, Drizzle ORM |
| Web App | Next.js 15, React 19, Tailwind CSS |
| Mobile | Expo 52, React Native 0.76 |
| Desktop | Tauri 2 (Rust + WebView) |
| Docs | Docusaurus 3 |
| i18n | i18next (vi/en built-in) |
| Validation | Zod + class-validator |
| Offline Sync | Dexie (IndexedDB) + CRDT vector clocks |

## Cấu trúc dự án

```
smart-erp-next/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js 15 web app
│   ├── mobile/       # Expo React Native
│   ├── desktop/      # Tauri desktop
│   └── docs/         # Docusaurus docs
├── packages/
│   ├── database/     # Drizzle ORM schemas & migrations
│   ├── i18n/         # i18next (vi/en translations)
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Zod schemas
│   ├── sync/         # Offline sync + CRDT service
│   ├── ui/           # Shared UI components
│   ├── config-eslint/
│   └── config-typescript/
└── docs/             # API documentation
```

## Modules

- **Dashboard** — Tổng quan doanh thu, đơn hàng, khách hàng, tồn kho
- **POS** — Bán hàng tại quầy (đang phát triển)
- **Đơn hàng** — Quản lý đơn bán, trạng thái, thanh toán
- **Sản phẩm** — CRUD, SKU, tồn kho, danh mục
- **Kho hàng** — Nhập/xuất kho, điều chỉnh, chuyển kho
- **Khách hàng** — CRM cơ bản, công nợ, điểm tích lũy
- **Nhà cung cấp** — Quản lý NCC, công nợ
- **Mua hàng** — Đơn nhập hàng, nhận hàng
- **Báo cáo** — Doanh thu, lợi nhuận, tồn kho
- **Cài đặt** — Thông tin công ty, phân quyền

## Database Schema

```
tenants → users → products → product_categories
                           → inventory_transactions
       → customers
       → suppliers
       → warehouses
       → orders → order_items
       → purchase_orders → purchase_order_items
       → payments
```

## Bắt đầu

### Yêu cầu

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 14

### Cài đặt

```bash
git clone https://github.com/your-org/smart-erp-next.git
cd smart-erp-next
pnpm install

# Cấu hình môi trường
cp apps/api/.env.example apps/api/.env
# Chỉnh sửa DATABASE_URL và JWT_SECRET

# Chạy migrations
cd packages/database && pnpm generate && pnpm migrate

# Khởi động dev servers
pnpm dev
```

### Biến môi trường

`apps/api/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/smart_erp
JWT_SECRET=your-secret-key-min-32-chars
PORT=3000
```

`apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Danh sách (phân trang, tìm kiếm) |
| GET | `/products/:id` | Chi tiết |
| POST | `/products` | Tạo mới |
| PATCH | `/products/:id` | Cập nhật |
| DELETE | `/products/:id` | Xóa |
| PATCH | `/products/:id/stock` | Điều chỉnh tồn kho |

### Customers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/customers` | Danh sách |
| GET | `/customers/:id` | Chi tiết |
| POST | `/customers` | Tạo mới |
| PATCH | `/customers/:id` | Cập nhật |
| DELETE | `/customers/:id` | Xóa |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/orders` | Danh sách |
| GET | `/orders/:id` | Chi tiết + items |
| POST | `/orders` | Tạo đơn hàng |
| PATCH | `/orders/:id/status` | Cập nhật trạng thái |

## Commit Convention

Format: `type(scope): mô tả`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Scopes: `api`, `web`, `mobile`, `desktop`, `db`, `i18n`, `ui`, `sync`, `types`

Ví dụ:
- `feat(api): add customers module with CRUD and debt tracking`
- `feat(web): add customers page with search and pagination`
- `feat(db): add orders, customers, suppliers, warehouses schemas`
- `feat(i18n): expand vi/en translations for all modules`

## License

MIT
