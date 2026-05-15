# Smart ERP Next — Roadmap

## ✅ AI-Powered Demand Forecasting & Inventory Optimization — COMPLETED
- Python Prophet ML microservice
- Inventory-aware reorder suggestions
- Full UI across Web, Mobile, Desktop
- Docker deployment, tests, i18n, docs

## ✅ Manufacturing Module — Advanced Production Planning — COMPLETED
- Multi-level BOM with wastage tracking
- Production orders (draft → in_progress → completed)
- QC checkpoints
- MRP engine (net requirements from forecast + sales orders)
- Cost roll-up (material + labor + overhead)
- Variance analysis (standard vs actual)
- Full UI across Web, Mobile, Desktop

## ✅ Quality Management System (QMS) — COMPLETED
- Inspection plans with AQL sampling rules
- NCR (Non-Conformance Reports) with severity tracking
- CAPA (Corrective/Preventive Actions) workflow
- Supplier quality scoring (A-F grade)
- Quality reports with pass rate statistics
- Full UI with tabs (Inspections, NCRs, SPC)

## Next Feature: Advanced Analytics Dashboard

**Goal:** Build real-time analytics dashboard vượt trội ERPNext/Odoo with:
- Real-time KPI monitoring with drill-down capability
- AI-powered business insights and anomaly detection
- Custom report builder with drag-and-drop
- Export to PDF/Excel/CSV

### Key Components

1. **Real-time KPI Dashboard**
   - Revenue, orders, inventory, production metrics
   - Real-time WebSocket updates
   - Drill-down from summary to detail

2. **AI-Powered Insights**
   - Anomaly detection (unusual patterns)
   - Trend analysis with forecasting
   - Natural language query interface

3. **Custom Report Builder**
   - Drag-and-drop field selection
   - Chart types: bar, line, pie, funnel, heatmap
   - Save and schedule reports

### Implementation Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1 | 1 week | KPI service + real-time WebSocket |
| 2 | 1 week | AI insights + anomaly detection |
| 3 | 1 week | Report builder UI |
| 4 | 3 days | Export (PDF/Excel/CSV) |

---
*Roadmap reviewed: 2026-05-15*