# Smart ERP Next — E-commerce Integration Hub (Web UI)

Ngày: 2026-05-13

## 1) Mục tiêu

Xây dựng Web UI vận hành được cho E-commerce Integration Hub, giúp người dùng:
- Quản lý danh sách kết nối store (platform, cấu hình, bật/tắt).
- Chủ động chạy đồng bộ dữ liệu (products/orders/inventory) theo store hoặc toàn bộ.
- Theo dõi trạng thái và lịch sử đồng bộ (logs), để xử lý lỗi nhanh.

Điểm khác biệt (so với KiotViet/Nhanhvn/MISA):
- Hiển thị trạng thái sync rõ ràng, có logs chi tiết, theo tenant.
- Kiến trúc monorepo packages/apps, i18n vi/en đồng nhất.

## 2) Phạm vi

### In-scope (vòng này)
- Web page trong `apps/web/src/app/settings/ecommerce/page.tsx` với 3 khối:
  1. Stores list
  2. Create Store form
  3. Sync Logs
- i18n keys (vi/en) đầy đủ cho Ecommerce Hub UI.
- API integration sử dụng các endpoint hiện có:
  - `GET /ecommerce/stores`
  - `POST /ecommerce/stores`
  - `POST /ecommerce/sync/all`
  - `POST /ecommerce/stores/:storeId/sync`
  - `GET /ecommerce/logs?storeId=...`

### Out-of-scope (để vòng sau)
- Chuẩn hoá toàn bộ marketplace VN (Shopee/Lazada/TikTok) auth/signature.
- Dashboard omnichannel (tổng hợp doanh thu theo kênh).
- Mobile UI cho Ecommerce Hub.

## 3) UX / UI thiết kế

### 3.1 Stores list
Hiển thị dạng table/card:
- platform (badge)
- name
- isActive
- lastSyncAt
- lastSyncStatus (success/partial/failed/pending)

Actions:
- Sync store
- Xem logs (filter theo storeId)

### 3.2 Create Store form
Form tối thiểu:
- platform (select)
- name (input)
- configJson (textarea) — giai đoạn 1 dùng raw JSON để ship nhanh.

Sau khi tạo thành công:
- toast success
- refresh list

### 3.3 Sync Logs
Danh sách 50 logs gần nhất:
- storeId
- syncType
- status
- itemsProcessed
- errorMessage
- startedAt / completedAt

Có filter `storeId`.

## 4) i18n

- Không hardcode tiếng Việt trong code.
- Thêm keys vào:
  - `packages/i18n/src/locales/vi/common.json`
  - `packages/i18n/src/locales/en/common.json`

Key namespace đề xuất: `ecommerce.*`
Ví dụ:
- `ecommerce.title`
- `ecommerce.stores.title`
- `ecommerce.stores.platform`
- `ecommerce.stores.name`
- `ecommerce.actions.syncAll`
- `ecommerce.actions.syncStore`
- `ecommerce.logs.title`
- `ecommerce.logs.empty`

## 5) Kiến trúc & data flow

- Web gọi API qua `@/lib/api-client`.
- Auth pages đã có guard toàn cục; trang settings đang dùng JWT qua apiClient.
- Tất cả dữ liệu được scope theo tenantId ở backend.

Flow chính:
1) Load page → GET /ecommerce/stores
2) User tạo store → POST /ecommerce/stores → reload stores
3) User sync → POST /ecommerce/sync/all hoặc POST /ecommerce/stores/:storeId/sync
4) Reload logs → GET /ecommerce/logs?storeId=...

## 6) Error handling

- API lỗi: hiển thị toast `common.error`.
- Sync partial/failed: UI hiển thị lastSyncStatus; logs hiển thị errorMessage.

## 7) Testing & verification

Tối thiểu cho vòng này:
- Typecheck/lint (theo pipeline hiện có).
- Manual verification (web):
  - Vào Settings → Ecommerce: load stores OK
  - Create store OK
  - Sync all/store OK (hiển thị toast, refresh logs)

## 8) Non-functional requirements

- Encoding: UTF-8 không BOM, line endings LF.
- Không commit `.claude/scheduled_tasks.lock`.
- Commit theo convention `type(scope): ...`.
