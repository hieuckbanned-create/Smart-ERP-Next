# Smart ERP Next

**Hệ thống quản trị doanh nghiệp thế hệ mới** — vượt trội ERPNext, Odoo, KiotViet, Nhanhvn, MISA về tốc độ, trải nghiệm và khả năng mở rộng.

[![CI](https://github.com/hieuck/Smart-ERP-Next/actions/workflows/ci.yml/badge.svg)](https://github.com/hieuck/Smart-ERP-Next/actions/workflows/ci.yml)
[![Release](https://github.com/hieuck/Smart-ERP-Next/actions/workflows/release.yml/badge.svg)](https://github.com/hieuck/Smart-ERP-Next/actions/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://github.com/hieuck/Smart-ERP-Next/pkgs/container/smart-erp-next)

---

## Quick Start

**Yêu cầu:** Docker & Docker Compose

```bash
# 1. Clone & chạy — không cần .env, không cần cài đặt gì thêm
git clone https://github.com/hieuck/Smart-ERP-Next.git
cd Smart-ERP-Next
docker compose up -d

# 2. Mở trình duyệt
# Web: http://localhost:3457
# API: http://localhost:3456/api

# 3. Đăng nhập
# Email:    admin@smarterp.vn
# Mật khẩu: admin123
```

> Hệ thống tự động migrate database + seed dữ liệu demo ngay lần chạy đầu tiên.

### Dùng image từ GitHub Container Registry:

**Bước 1:** Pull image
```bash
docker pull ghcr.io/hieuck/smart-erp-next:latest
```

**Bước 2:** Chạy PostgreSQL (nếu chưa có)
```bash
docker run -d --name smart-erp-postgres \
  -e POSTGRES_USER=smart_erp -e POSTGRES_PASSWORD=smart_erp -e POSTGRES_DB=smart_erp \
  -v smart_erp_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

**Bước 3:** Chạy Smart ERP
```bash
docker run -d --name smart-erp -p 3457:3457 -p 3456:3456 \
  -e DATABASE_URL=postgresql://smart_erp:smart_erp@host.docker.internal:5432/smart_erp \
  -e JWT_SECRET=change-me-in-production \
  ghcr.io/hieuck/smart-erp-next:latest
```

---

## Modules

| Module | Trạng thái |
|--------|------------|
| Dashboard, POS, Orders | Hoàn chỉnh |
| Products, Inventory, Customers | Hoàn chỉnh |
| Suppliers, Purchasing, Payments | Hoàn chỉnh |
| Accounting, HR, Payroll | Hoàn chỉnh |
| CRM, E-Invoice, Manufacturing | Hoàn chỉnh |
| Analytics, Chat, Settings | Hoàn chỉnh |
| Quality (QMS), MRP, Projects | Hoàn chỉnh |
| Fixed Assets, Warehouses | Hoàn chỉnh |
| Approvals, Automation, Reports | Hoàn chỉnh |
| E-commerce sync, AI Copilot | Hoàn chỉnh |

---

## Kiến trúc

```
apps/
  api/          — NestJS REST API + WebSocket
  web/          — Next.js App Router (PWA)
packages/
  shared/       — UI components (Button, Table, Toast...)
  hooks/        — React hooks (useNotifications, useLocalStorage...)
  database/     — Drizzle ORM schema + migrations
  utils/        — Shared utilities
  validation/   — Zod schemas
  types/        — TypeScript types
  sync/         — Offline sync engine
  accounting/   — Accounting engine
```

---

## Phát triển

Xem [DEVELOPMENT.md](DEVELOPMENT.md)

## License

MIT
