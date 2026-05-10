# Kiến trúc hệ thống

Smart ERP Next được xây dựng theo kiến trúc monorepo, chia sẻ code giữa các nền tảng.

## Cấu trúc thư mục

```
smart-erp-next/
├── apps/
│   ├── api/          # Backend NestJS
│   ├── web/          # Web app Next.js 15
│   ├── mobile/       # Mobile app Expo 52
│   ├── desktop/      # Desktop app Tauri 2
│   └── docs/         # Docusaurus 3
├── packages/
│   ├── database/     # Drizzle ORM schemas
│   ├── i18n/         # i18next translations (vi/en)
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Zod schemas
│   ├── sync/         # Offline sync + CRDT
│   ├── ui/           # Shared UI components
│   ├── config-eslint/
│   └── config-typescript/
└── docs/             # API docs
```

## Công nghệ

| Thành phần | Công nghệ |
|-----------|-----------|
| Monorepo | pnpm + Turborepo |
| Backend | NestJS, JWT, bcrypt, Socket.IO |
| Database | PostgreSQL, Drizzle ORM |
| Web | Next.js 15, Tailwind CSS, React 19 |
| Mobile | Expo 52, React Native 0.76 |
| Desktop | Tauri 2 (Rust + WebView) |
| i18n | i18next, react-i18next |
| Validation | Zod + class-validator |
| Offline | Dexie (IndexedDB) + CRDT vector clocks |

## Database Schema

```
tenants
  └── users (role: admin/manager/user/accountant/warehouse/sales)
  └── products
        └── product_categories (hierarchical)
        └── inventory_transactions
  └── customers (groups: retail/wholesale/vip)
  └── suppliers
  └── warehouses
  └── orders
        └── order_items (snapshot tên/SKU lúc bán)
  └── purchase_orders
        └── purchase_order_items
  └── payments (phiếu thu/chi)
```

## Luồng dữ liệu

```
Client (web/mobile/desktop)
  │
  ├── Online: HTTP/WebSocket → NestJS API → PostgreSQL
  │
  └── Offline: IndexedDB (Dexie) → Sync Queue → processQueue() khi online
                                              → CRDT conflict resolution
```

## Multi-tenant

Mỗi request được inject `tenantId` qua:
1. JWT payload (`tenantId` field)
2. `X-Tenant-ID` header (fallback)
3. Tất cả queries đều filter theo `tenantId`

## RBAC (Role-Based Access Control)

| Role | Quyền |
|------|-------|
| admin | Toàn quyền |
| manager | Xem + sửa tất cả, không xóa |
| accountant | Kế toán, báo cáo |
| warehouse | Kho hàng, nhập/xuất |
| sales | Bán hàng, khách hàng |
| user | Chỉ xem |

## Offline-first & CRDT Sync

1. Mọi thao tác được ghi vào `syncQueue` (IndexedDB)
2. Khi online, `processQueue()` gửi lên server
3. Conflict (HTTP 409) được giải quyết bằng vector clock
4. Last-write-wins với merge strategy per entity type

## Real-time (Socket.IO)

Events:
- `user.registered` — Người dùng mới đăng ký
- `order.created` — Đơn hàng mới
- `order.status_changed` — Trạng thái đơn thay đổi
- `stock.low` — Cảnh báo sắp hết hàng
- `payment.received` — Nhận thanh toán

## Bản địa hóa (i18n)

- Ngôn ngữ mặc định: **Tiếng Việt** (`vi`)
- Hỗ trợ: `vi`, `en`
- Package: `@smart-erp/i18n`
- Namespace: `common` (tất cả modules)
- Cấu trúc key: `module.key` (ví dụ: `products.title`, `orders.status`)
