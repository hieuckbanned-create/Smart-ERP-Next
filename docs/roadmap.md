# Smart ERP Next – Roadmap

## ✅ AI-Powered Demand Forecasting & Inventory Optimization — COMPLETED

**Goal:** vượt trội ERPNext, Odoo, KiotViet, Nhanhvn, MISA bằng ML-driven inventory management.

### ✅ Completed Deliverables

| Phase | Components | Status | Files |
|-------|-----------|--------|-------|
| **1 - Prophet Model** | Data pipeline + baseline Prophet ML | ✅ Done | `apps/ai-forecast/main.py` |
| **2 - Inventory Optimization** | Reorder suggestions, safety stock, stockout prediction | ✅ Done | `apps/api/src/forecast/`, `apps/api/src/inventory-recommendation/` |
| **3 - API + Full UI** | Web dashboard, Mobile screens, Desktop app | ✅ Done | Web/Mobile/Desktop (`forecast/page.tsx`, `ForecastScreen.tsx`, ...) |
| **4 - Infra** | Docker, tests, i18n, docs | ✅ Done | `docker-compose.yml`, `Dockerfile`, `*.spec.ts`, docs |

### Architecture Implemented

```
┌─────────────────┐    HTTP POST    ┌──────────────────────┐
│  NestJS API     │ ──────────────► │  Python AI Service   │
│  /forecast/*    │                 │  (apps/ai-forecast)  │
└─────────────────┘                 └──────────────────────┘
      │                                      │
      ▼                                      ▼
┌─────────────────┐                 ┌──────────────────────┐
│  Frontend       │                 │  Facebook Prophet    │
│  (Web/Mobile/Desktop)             │  ML Model            │
└─────────────────┘                 └──────────────────────┘
```

### AI Endpoints
- `POST /forecast` — 30-day demand prediction with confidence intervals
- `POST /reorder-suggestion` — Inventory-aware reorder (stockout days, safety stock)
- `GET /health` — Service health check

## Next Feature: Manufacturing Module — Advanced Production Planning

**Goal:** Build production-grade Manufacturing module vượt trội ERPNext/Odoo in:
- Multi-level BOM (Bill of Materials)
- MRP (Material Requirements Planning) with AI demand input
- Shop floor control with real-time tracking
- Cost roll-up and variance analysis

### Key Components

1. **Multi-Level BOM**
   - Parent-child component relationships (unlimited depth)
   - Phantom assemblies and configurable BOMs
   - Engineering vs Manufacturing BOM versions

2. **MRP Engine**
   - Net requirements calculation from forecast/sales orders
   - Purchase suggestion generation
   - Lead time offsetting

3. **Production Orders**
   - Order release, scheduling, and routing
   - Material reservation and backflush
   - Labor and machine time tracking

4. **Costing**
   - Standard vs actual cost comparison
   - Overhead absorption
   - Variance analysis (material, labor, overhead)

### Implementation Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1 | 1 week | Multi-level BOM schema + CRUD API |
| 2 | 1 week | Production orders + scheduling |
| 3 | 1 week | MRP calculation engine |
| 4 | 1 week | UI: Web + Mobile + Desktop |
| 5 | 3 days | Cost roll-up + variance analysis |

---
*Roadmap reviewed: 2026-05-15*
