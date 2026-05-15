# E-commerce Integration Hub (Web UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện Web UI vận hành được cho Ecommerce Hub: quản lý stores, chạy sync, xem logs — với i18n vi/en và commit sạch.

**Architecture:** Tận dụng trang hiện có `apps/web/src/app/settings/ecommerce/page.tsx`, mở rộng thành 3 khối (Stores / Create / Logs). Web gọi API qua `@/lib/api-client` vào các endpoint `/ecommerce/*` đã có ở API.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind, `@smart-erp/ui`, i18next, axios client `@/lib/api-client`.

---

## 0) File map (create/modify)

**Modify:**
- `apps/web/src/app/settings/ecommerce/page.tsx`
- `packages/i18n/src/locales/vi/common.json`
- `packages/i18n/src/locales/en/common.json`
- `CHANGELOG.md` (thêm mục Ecommerce Hub Web UI)

**Do NOT commit:**
- `.claude/scheduled_tasks.lock`

---

### Task 1: Chuẩn hoá trang Settings/Ecommerce để compile và có i18n keys tối thiểu

**Files:**
- Modify: `apps/web/src/app/settings/ecommerce/page.tsx`
- Modify: `packages/i18n/src/locales/vi/common.json`
- Modify: `packages/i18n/src/locales/en/common.json`

- [ ] **Step 1: Thêm i18n keys tối thiểu cho Ecommerce page**

Add (ví dụ) vào `packages/i18n/src/locales/vi/common.json`:
```json
{
  "ecommerce": {
    "title": "Tích hợp thương mại điện tử",
    "stores": {
      "title": "Kết nối cửa hàng",
      "platform": "Nền tảng",
      "name": "Tên store",
      "active": "Kích hoạt",
      "lastSyncAt": "Lần sync gần nhất",
      "lastSyncStatus": "Trạng thái sync"
    },
    "create": {
      "title": "Tạo kết nối",
      "platform": "Nền tảng",
      "name": "Tên",
      "configJson": "Cấu hình (JSON)"
    },
    "logs": {
      "title": "Lịch sử đồng bộ",
      "empty": "Chưa có bản ghi đồng bộ",
      "status": "Trạng thái",
      "syncType": "Loại đồng bộ",
      "itemsProcessed": "Đã xử lý",
      "error": "Lỗi",
      "startedAt": "Bắt đầu",
      "completedAt": "Hoàn tất"
    },
    "actions": {
      "createStore": "Tạo store",
      "syncAll": "Sync tất cả",
      "syncStore": "Sync store",
      "viewLogs": "Xem logs"
    }
  }
}
```

Add tương ứng vào `packages/i18n/src/locales/en/common.json`:
```json
{
  "ecommerce": {
    "title": "E-commerce Integrations",
    "stores": {
      "title": "Stores",
      "platform": "Platform",
      "name": "Store name",
      "active": "Active",
      "lastSyncAt": "Last sync",
      "lastSyncStatus": "Last status"
    },
    "create": {
      "title": "Create store",
      "platform": "Platform",
      "name": "Name",
      "configJson": "Config (JSON)"
    },
    "logs": {
      "title": "Sync logs",
      "empty": "No sync logs yet",
      "status": "Status",
      "syncType": "Sync type",
      "itemsProcessed": "Processed",
      "error": "Error",
      "startedAt": "Started",
      "completedAt": "Completed"
    },
    "actions": {
      "createStore": "Create store",
      "syncAll": "Sync all",
      "syncStore": "Sync store",
      "viewLogs": "View logs"
    }
  }
}
```

- [ ] **Step 2: Sửa trang `settings/ecommerce` để import đúng component và không có undefined**

Update import ở `apps/web/src/app/settings/ecommerce/page.tsx` để có `Select` (hiện đang dùng nhưng chưa import):
```ts
import { Card, Input, Button, Tabs, Tab, useToast, Select } from '@smart-erp/ui';
```

- [ ] **Step 3: Chạy typecheck/lint cho web**

Run:
```bash
pnpm -C apps/web lint
pnpm -C apps/web typecheck
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/settings/ecommerce/page.tsx packages/i18n/src/locales/vi/common.json packages/i18n/src/locales/en/common.json
git commit -m "fix(web,i18n): stabilize ecommerce settings page"
```

---

### Task 2: Implement Stores list (load + render + actions)

**Files:**
- Modify: `apps/web/src/app/settings/ecommerce/page.tsx`

- [ ] **Step 1: Thêm types cho Store + Log và hàm fetch**

Trong `page.tsx` thêm types:
```ts
type EcommerceStore = {
  id: string;
  platform: string;
  name: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
};

type EcommerceSyncLog = {
  id: string;
  storeId: string;
  syncType: string;
  status: string;
  itemsProcessed: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};
```

Thêm state + loader:
```ts
const [stores, setStores] = useState<EcommerceStore[]>([]);
const [logs, setLogs] = useState<EcommerceSyncLog[]>([]);
const [loadingStores, setLoadingStores] = useState(false);
const [loadingLogs, setLoadingLogs] = useState(false);
const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

const loadStores = async () => {
  setLoadingStores(true);
  try {
    const res = await apiClient.get('/ecommerce/stores');
    setStores(res.data || []);
  } catch {
    toast.error(t('common.error'));
  } finally {
    setLoadingStores(false);
  }
};

const loadLogs = async (storeId?: string | null) => {
  setLoadingLogs(true);
  try {
    const res = await apiClient.get('/ecommerce/logs', { params: storeId ? { storeId } : {} });
    setLogs(res.data || []);
  } catch {
    toast.error(t('common.error'));
  } finally {
    setLoadingLogs(false);
  }
};
```

Gọi trong `useEffect`:
```ts
useEffect(() => {
  loadStores();
  loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] **Step 2: Render Stores list + actions Sync/Logs**

Thêm khối UI (giữ tối giản, không refactor lớn):
- Header: title + nút `Sync all`
- List: map stores thành Card rows
- Action per store:
  - `Sync store` → `POST /ecommerce/stores/:id/sync` rồi `loadStores()` + `loadLogs(id)`
  - `View logs` → setSelectedStoreId + `loadLogs(id)`

Pseudo-code cho sync:
```ts
const syncAll = async () => {
  try {
    await apiClient.post('/ecommerce/sync/all');
    toast.success(t('actions.success'));
    await loadStores();
    await loadLogs(selectedStoreId);
  } catch {
    toast.error(t('common.error'));
  }
};

const syncStore = async (storeId: string) => {
  try {
    await apiClient.post(`/ecommerce/stores/${storeId}/sync`);
    toast.success(t('actions.success'));
    await loadStores();
    setSelectedStoreId(storeId);
    await loadLogs(storeId);
  } catch {
    toast.error(t('common.error'));
  }
};
```

- [ ] **Step 3: Run web lint/typecheck**

```bash
pnpm -C apps/web lint
pnpm -C apps/web typecheck
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/settings/ecommerce/page.tsx
git commit -m "feat(web): add ecommerce stores list and sync actions"
```

---

### Task 3: Implement Create Store form (platform/name/configJson) + refresh

**Files:**
- Modify: `apps/web/src/app/settings/ecommerce/page.tsx`

- [ ] **Step 1: Chuẩn hoá UI theo spec (raw JSON giai đoạn 1)**

Tạo form dùng các trường:
- platform: Select options tối thiểu: `tiktokshop`, `amazon`, `ebay`
- name: Input
- configJson: textarea (dùng `Input` nếu hỗ trợ multiline; nếu không, dùng `<textarea>` className Tailwind)

State:
```ts
const [newStore, setNewStore] = useState({ platform: 'tiktokshop', name: '', configJson: '{}' });
const [creating, setCreating] = useState(false);
```

Submit:
```ts
const createStore = async () => {
  setCreating(true);
  try {
    JSON.parse(newStore.configJson);
    await apiClient.post('/ecommerce/stores', {
      platform: newStore.platform,
      name: newStore.name,
      configJson: newStore.configJson,
    });
    toast.success(t('actions.success'));
    setNewStore({ platform: 'tiktokshop', name: '', configJson: '{}' });
    await loadStores();
  } catch {
    toast.error(t('common.error'));
  } finally {
    setCreating(false);
  }
};
```

- [ ] **Step 2: Run web lint/typecheck**

```bash
pnpm -C apps/web lint
pnpm -C apps/web typecheck
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/settings/ecommerce/page.tsx
git commit -m "feat(web): add ecommerce store creation form"
```

---

### Task 4: Implement Sync Logs UI (filter theo storeId, empty/loading states)

**Files:**
- Modify: `apps/web/src/app/settings/ecommerce/page.tsx`
- Modify: `packages/i18n/src/locales/vi/common.json`
- Modify: `packages/i18n/src/locales/en/common.json`

- [ ] **Step 1: Thêm UI filter storeId + render logs**

- Filter: Select store (All + từng store)
- Render: table/card list logs
- Empty state: `t('ecommerce.logs.empty')`

- [ ] **Step 2: Bổ sung i18n keys nếu thiếu (status labels)**

Nếu muốn hiển thị label status thân thiện, thêm keys:
- `ecommerce.status.success|partial|failed|pending`

- [ ] **Step 3: Run web lint/typecheck**

```bash
pnpm -C apps/web lint
pnpm -C apps/web typecheck
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/settings/ecommerce/page.tsx packages/i18n/src/locales/vi/common.json packages/i18n/src/locales/en/common.json
git commit -m "feat(web): add ecommerce sync logs panel"
```

---

### Task 5: Update docs (CHANGELOG) + verify encoding/format + final commit

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update CHANGELOG Unreleased**

Add dưới `[Unreleased]`:
- Web UI Ecommerce Hub (Stores/Sync/Logs)

- [ ] **Step 2: Verify working tree không có `.claude/scheduled_tasks.lock` staged**

Run:
```bash
git status --short
```
Expected: KHÔNG stage `.claude/scheduled_tasks.lock`.

- [ ] **Step 3: Commit docs**

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for ecommerce hub web UI"
```

- [ ] **Step 4: Final verification**

Run:
```bash
pnpm -C apps/web lint
pnpm -C apps/web typecheck
```
Expected: PASS.
