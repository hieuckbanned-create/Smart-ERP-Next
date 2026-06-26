# Contributing

Cảm ơn bạn đã quan tâm đến Smart ERP Next! Dưới đây là hướng dẫn để bắt đầu.

## Quick Start

```bash
git clone https://github.com/hieuck/Smart-ERP-Next.git
cd Smart-ERP-Next
```

**Windows:** `dev.bat` → mở `http://localhost:3457`

**Mac/Linux:** `./scripts/dev.sh` → mở `http://localhost:3457`

## Prerequisites

| Tool    | Version   | Ghi chú                                  |
| ------- | --------- | ---------------------------------------- |
| Docker  | latest    | Cho PostgreSQL (dev.bat tự động start)    |
| pnpm    | 10.x      | Node.js package manager                  |
| Node.js | 18+ / 20+ | Khuyên dùng LTS                          |

## Development Workflow

| Platform  | Command             | What it does                                  |
| --------- | ------------------- | --------------------------------------------- |
| Windows   | `dev.bat`           | Start PostgreSQL → migrate → API + Web (2 cửa sổ) |
| Mac/Linux | `scripts/dev.sh`    | Tương tự, chạy trong terminal                 |

- **API:** `http://localhost:3456` (hot-reload)
- **Web:** `http://localhost:3457` (hot-reload)

## TDD Rule: RED → GREEN

**Viết test trước, luôn luôn.**

1. **RED** — Viết test thất bại trước
2. **GREEN** — Viết code tối thiểu để pass
3. **REFACTOR** — Cải thiện code, đảm bảo test vẫn xanh

Nếu viết code trước, quay lại viết test sau khi xong — nhưng ưu tiên RED→GREEN.

## Code Style

- **Code & commits:** English
- **Communication:** Vietnamese (issues, PRs, comments trong team chat)
- **Comments:** English only
- **Formatting:** Prettier (`pnpm format`)
- **No speculative code** — chỉ viết những gì cần thiết

## Quality Gate

Chạy **trước mọi commit**:

```bash
pnpm qa:commit
```

Quy trình: lint → i18n audit → type-check → test → build. Nếu fail, fix root cause — không bypass.

## Conventional Commits

```
feat: add sales invoice validation
fix: prevent division by zero in tax calc
test: add e2e for purchase order flow
refactor: extract currency formatter
docs: update API endpoint list
ci: speed up Docker build cache
chore: bump drizzle-orm to 0.40
```

## Branch Strategy

```
main          → Production (stable, protected)
  └── dev     → Integration (luôn xanh)
       └── feat/xxx   → Feature branches
       └── fix/xxx    → Bugfix branches
       └── refactor/  → Refactoring
```

1. Tạo branch từ `dev`
2. Commit, push, tạo PR vào `dev`
3. Review → merge → xoá branch

## Running Tests

```bash
pnpm test          # Unit + integration (Jest)
pnpm test:e2e      # E2E (Playwright) — cần DB + API + Web đang chạy
pnpm test:cov      # With coverage
pnpm qa:commit     # Full quality gate (khuyên dùng)
```

## Project Structure

```
smart-erp-next/
├── apps/
│   ├── api/          # NestJS API (port 3456)
│   └── web/          # Next.js web app (port 3457)
├── packages/
│   ├── shared/       # UI components, hooks, localization
│   ├── hooks/        # React hooks
│   ├── database/     # Drizzle schema, migrations, seed
│   ├── utils/        # Shared utilities
│   ├── validation/   # Zod validation schemas
│   ├── types/        # Shared TypeScript types
│   ├── sync/         # Offline-first sync engine
│   └── accounting/   # Accounting engine
├── e2e/              # Playwright E2E tests
├── scripts/          # Dev/CI scripts
└── .github/          # GitHub Actions workflows
```

## Need Help?

Mở issue tại [github.com/hieuck/Smart-ERP-Next/issues](https://github.com/hieuck/Smart-ERP-Next/issues).
