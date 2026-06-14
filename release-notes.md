# Smart ERP Next v0.1.0 — First Stable Release

## Overview
Smart ERP Next is a modern, multi-platform ERP system built with NestJS, Next.js, React Native, and Tauri. This first stable release delivers a comprehensive suite of business management tools.

## Key Modules
- **Inventory Management**: Stock tracking, warehouse transfers, lot/serial tracking, reorder points
- **Sales & POS**: Order management, POS terminal with 6 payment methods
- **Purchasing**: Purchase orders, supplier management, goods receipt
- **Customer & Supplier Management**: CRM, loyalty program, debt tracking
- **HR & Payroll**: Employee management, attendance, payroll processing
- **Accounting**: Chart of accounts, journal entries, VAT, tax declaration, financial reports
- **AI-Powered Forecasting**: Demand forecasting with Python Prophet ML service
- **Manufacturing**: BOM, MRP, production orders
- **Quality Management**: Inspection plans, QMS workflows
- **Project Management**: Projects, tasks, milestones, time tracking
- **Fixed Assets**: Asset tracking, straight-line depreciation
- **Helpdesk**: Ticket management with priority/status/category
- **Omnichannel**: E-commerce integration (Shopee/Lazada/TikTok/Amazon/eBay)
- **Analytics & Reports**: Revenue, profit, inventory reports, cashflow forecast

## Platforms
- **Web**: Next.js 14 dashboard (desktop-first responsive)
- **Mobile**: React Native / Expo (iOS + Android)
- **Desktop**: Tauri 2 (Windows, macOS, Linux)

## Key Features
- Multi-tenant architecture with full data isolation
- Real-time notifications via Socket.IO
- Offline-first sync with Dexie + CRDT merge
- i18n support (Vietnamese/English)
- Docker deployment ready
- CI/CD with GitHub Actions

## Quality
- 192 test suites, 716 unit tests passing
- 70%+ code coverage threshold
- Production-quality gate enforcement
