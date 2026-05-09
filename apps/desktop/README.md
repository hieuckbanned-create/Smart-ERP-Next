# Smart ERP Next - Desktop Application (Tauri)

## Tổng quan

Ứng dụng desktop native được xây dựng với [Tauri](https://tauri.app/) v2, cung cấp trải nghiệm vượt trội so với các ERP chỉ có web (ERPNext, Odoo, Misa). Hỗ trợ offline‑first, đồng bộ CRDT và thanh menu native.

## Tính năng chính

- ⚡ **Native menu** (File, Edit, View) với phím tắt
- 🔌 **Offline‑first** – làm việc không cần mạng
- 🤝 **Sync CRDT** – giải quyết xung đột tự động
- 🖥️ **Trải nghiệm native** – không giống web trong app

## Phím tắt bàn phím

| Tổ hợp | Hành động |
|--------|-----------|
| `Ctrl+N` / `Cmd+N` | Tạo mới |
| `Ctrl+O` / `Cmd+O` | Mở file... |
| `Ctrl+S` / `Cmd+S` | Lưu |
| `Ctrl+P` / `Cmd+P` | Xuất PDF |
| `Ctrl+R` / `Cmd+R` | Tải lại giao diện |
| `Ctrl+Shift+I` / `Cmd+Shift+I` | Mở Developer Tools |

Menu Edit hỗ trợ Undo/Redo/Cut/Copy/Paste/SelectAll chuẩn native.

## Phát triển

```bash
# Chạy dev
pnpm dev --filter @smart-erp/desktop

# Build production
pnpm build --filter @smart-erp/desktop
```

## Lưu ý đặc thù nền tảng

- **Windows**: Cửa sổ console ẩn trong bản release nhờ `windows_subsystem = "windows"`
- **macOS**: Menu sẽ tự động chuyển thành menu ứng chuẩn macOS
- **Linux**: Tùy thuộc desktop environment, phím tắt hoạt động đầy đủ

## Encoding

Tất cả file nguồn đều được lưu với **UTF-8 không BOM**. Nếu gặp lỗi hiển thị tiếng Việt, kiểm tra lại encoding của file JSON i18n.

## Build và phân phối

Xem [Tauri Distribution](https://tauri.app/distribute/) để tạo installer cho từng nền tảng.