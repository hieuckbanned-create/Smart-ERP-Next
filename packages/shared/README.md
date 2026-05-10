# @smart-erp/shared

Shared product architecture constants for Smart ERP Next.

This package is framework-free and can be consumed by API, web, mobile, desktop, docs, tests, and future native clients. Keep cross-platform product definitions here before duplicating them inside an app.

## Contains

- Native platform registry: API, web, mobile, desktop, docs.
- ERP module catalog with ownership, offline, realtime, and localization flags.
- Vietnam-first localization profile with currency, timezone, tax, and payment conventions.
- Competitive pillars used to keep implementation decisions ahead of ERPNext, Odoo, VietERP, KiotViet, Nhanhvn, and MISA.

## Rule

If data affects more than one app, put it in this package or another package under `packages/*`; apps should only compose shared capabilities into native experiences.
