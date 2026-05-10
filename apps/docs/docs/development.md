# Hướng dẫn phát triển

## Yêu cầu

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 14
- Rust (cho Tauri desktop)
- Expo CLI (cho mobile)

## Cài đặt

```bash
git clone https://github.com/your-org/smart-erp-next.git
cd smart-erp-next
pnpm install
```

## Cấu hình môi trường

```bash
# API
cp apps/api/.env.example apps/api/.env
# Chỉnh sửa DATABASE_URL và JWT_SECRET

# Web
cp apps/web/.env.example apps/web/.env.local
# Chỉnh sửa NEXT_PUBLIC_API_URL
```

## Database

```bash
# Chạy migration SQL trực tiếp
psql $DATABASE_URL -f packages/database/drizzle/0001_initial_schema.sql

# Hoặc dùng Drizzle migrate
cd packages/database
pnpm migrate

# Tạo migration mới sau khi thay đổi schema
pnpm generate
```

## Khởi động dev servers

```bash
# Tất cả cùng lúc (Turborepo)
pnpm dev

# Riêng lẻ
pnpm --filter @smart-erp/api dev        # API: http://localhost:3000
pnpm --filter @smart-erp/web dev        # Web: http://localhost:3001
pnpm --filter @smart-erp/mobile start   # Mobile: Expo
pnpm --filter @smart-erp/desktop dev    # Desktop: Tauri
pnpm --filter @smart-erp/docs start     # Docs: http://localhost:3002
```

## Cấu trúc packages

| Package | Mô tả |
|---------|-------|
| `@smart-erp/database` | Drizzle ORM schemas, migrations |
| `@smart-erp/types` | TypeScript types dùng chung |
| `@smart-erp/validation` | Zod schemas cho form/API validation |
| `@smart-erp/i18n` | i18next translations (vi/en) |
| `@smart-erp/sync` | Offline sync + CRDT service |
| `@smart-erp/ui` | Shared React components |
| `@smart-erp/hooks` | Shared React hooks |

## API Modules

| Module | Endpoint | Mô tả |
|--------|----------|-------|
| Auth | `/auth` | Đăng nhập, đăng ký |
| Products | `/products` | CRUD + stock adjustment |
| Customers | `/customers` | CRUD + debt tracking |
| Suppliers | `/suppliers` | CRUD |
| Orders | `/orders` | Tạo đơn, cập nhật trạng thái |
| Inventory | `/inventory` | Nhập/xuất kho, tồn kho |
| Reports | `/reports` | Doanh thu, lợi nhuận, tồn kho |
| Insights | `/insights` | Dashboard analytics |
| Users | `/users` | Quản lý người dùng |
| Tenants | `/tenants` | Quản lý tenant |

## Web Pages

| Route | Mô tả |
|-------|-------|
| `/login` | Đăng nhập |
| `/dashboard` | Tổng quan |
| `/pos` | Bán hàng tại quầy |
| `/orders` | Danh sách đơn hàng |
| `/products` | Danh sách sản phẩm |
| `/products/create` | Tạo sản phẩm |
| `/products/[id]/edit` | Sửa sản phẩm |
| `/inventory` | Kho hàng |
| `/customers` | Khách hàng |
| `/suppliers` | Nhà cung cấp |
| `/reports` | Báo cáo |
| `/settings` | Cài đặt |

## Commit Convention

```
type(scope): mô tả ngắn gọn

Types: feat, fix, docs, style, refactor, test, chore
Scopes: api, web, mobile, desktop, db, i18n, ui, sync, types, validation, hooks
```

## Testing

```bash
pnpm test              # Tất cả
pnpm --filter @smart-erp/api test   # API tests
```

## Build production

```bash
pnpm build
```
