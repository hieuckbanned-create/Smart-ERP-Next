# Smart ERP Next – Mobile (React Native + Expo)

## Tổng quan

Ứng dụng mobile native cho Smart ERP Next, được xây dựng với **React Native** và **Expo**, tái sử dụng các package từ monorepo (`@smart-erp/sync`, `@smart-erp/i18n`, `@smart-erp/types`).

## Tính năng chính

- ⚡ **Offline‑first** – làm việc không cần mạng, dữ liệu lưu trữ trên thiết bị (SQLite)
- 🔄 **Sync CRDT** – giải quyết xung đột tự động khi có mạng nhờ vector clock
- 🌍 **Bản địa hóa** – tiếng Việt mặc định, dễ dàng thêm ngôn ngữ khác qua `packages/i18n`
- 📱 **Native UX** – trải nghiệm React Native thuần, không phải web view

## Cài đặt & chạy

```bash
# Cài dependencies (từ thư mục gốc)
pnpm install

# Chạy development server
cd apps/mobile
pnpm start

# Chạy trên Android
pnpm android

# Chạy trên iOS (chỉ macOS)
pnpm ios
```

## Tích hợp monorepo

- **Sync**: `@smart-erp/sync` cung cấp `SyncService` và offline database (sẽ dùng Expo SQLite thay IndexedDB trong tương lai)
- **I18n**: `@smart-erp/i18n` đã cấu hình sẵn locale tiếng Việt
- **Types**: dùng chung kiểu dữ liệu

## Encoding

Tất cả file nguồn và file JSON đều lưu với **UTF‑8 không BOM** để hiển thị đúng tiếng Việt.

## Build production

Tuân theo hướng dẫn của Expo:
```bash
pnpm dlx eas-cli build --platform android --profile production
pnpm dlx eas-cli build --platform ios --profile production
```

CI release cần các secret thật:

- `EXPO_TOKEN`: Expo access token dùng cho EAS non-interactive build.
- `EAS_PROJECT_ID`: UUID project EAS thật; không dùng placeholder như slug repo.
- Apple signing credentials: đã cấu hình trong EAS/Expo account để build iOS `.ipa`.

Sau khi build xong, tải artifact cài đặt về repository trước khi chạy release gate:

```bash
mkdir -p artifacts/android artifacts/ios
# Android: đặt file .apk hoặc .aab vào artifacts/android/
# iOS: đặt file .ipa vào artifacts/ios/
pnpm verify:native-artifacts
```

Lưu ý: iOS `.ipa` cần macOS/Xcode hoặc EAS cloud build với Apple signing credentials hợp lệ. Không tạo placeholder `.ipa`; release gate chỉ pass khi có artifact cài đặt thật.

Nếu phát hành tạm thời chưa bao gồm iOS, có thể bỏ qua riêng iOS artifact một cách tường minh:

```bash
SKIP_IOS_ARTIFACT=1 pnpm verify:native-artifacts
SKIP_IOS_ARTIFACT=1 pnpm qa:release
```

Chỉ dùng chế độ này cho release web/API/Android/Windows; iOS vẫn phải được phát hành sau khi có `.ipa` thật.
