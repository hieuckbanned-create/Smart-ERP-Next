# Hướng dẫn Beta Test — Smart ERP Next v0.4.0

Cảm ơn bạn đã tham gia beta test! Tài liệu này giúp bạn cài đặt và bắt đầu kiểm thử hệ thống trong vòng 10 phút.

---

## Yêu cầu hệ thống

| Thứ | Tối thiểu |
|-----|-----------|
| OS | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| RAM | 4 GB (khuyến nghị 8 GB) |
| Disk | 5 GB trống |
| Phần mềm | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

> **Không cần** cài Node.js, Python, PostgreSQL — Docker lo hết.

---

## Cài đặt (5 phút)

### Bước 1 — Tải source code

```bash
git clone https://github.com/smart-erp/smart-erp-next.git
cd smart-erp-next
```

Hoặc tải file ZIP từ trang Releases và giải nén.

### Bước 2 — Cấu hình môi trường

```bash
# Sao chép file cấu hình mẫu
cp .env.example .env
```

Mở file `.env` và chỉnh 3 dòng bắt buộc:

```env
DB_PASSWORD=mat_khau_manh_cua_ban
JWT_SECRET=chuoi_ngau_nhien_it_nhat_32_ky_tu
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> Nếu chạy trên server từ xa (VPS), thay `localhost` bằng IP của server:
> `NEXT_PUBLIC_API_URL=http://123.456.789.0:3000`

### Bước 3 — Khởi động

**Windows:**
```powershell
.\deploy.ps1
```

**macOS / Linux:**
```bash
docker-compose up -d --build
```

Lần đầu build mất khoảng 3–5 phút (tải dependencies). Các lần sau chỉ ~30 giây.

### Bước 4 — Truy cập

| Dịch vụ | URL |
|---------|-----|
| 🌐 Web Dashboard | http://localhost:3001 |
| 📡 API Swagger | http://localhost:3000/api |
| 🤖 AI Forecast | http://localhost:8000/docs |

---

## Tài khoản mặc định

Sau khi hệ thống khởi động, đăng ký tài khoản mới tại `/register` hoặc dùng seed data:

```bash
# Chạy seed data (tạo tenant + admin mẫu)
docker-compose exec api node apps/api/dist/common/seeds/main.seed.js
```

Tài khoản sau khi seed:
- **Email**: `admin@demo.com`
- **Password**: `Admin@123456`

---

## Các tính năng cần kiểm thử trong v0.4.0

Ưu tiên kiểm thử các tính năng mới nhất:

### 🎫 Helpdesk & Ticketing
- [ ] Tạo ticket mới với priority (low/medium/high/urgent)
- [ ] Thay đổi status ticket (open → in_progress → resolved)
- [ ] Lọc ticket theo category

### 🤖 AI Demand Forecasting
- [ ] Vào **Analytics → Forecast** — xem dự báo nhu cầu 30 ngày
- [ ] Kiểm tra gợi ý nhập hàng tự động
- [ ] Xem confidence level và MAPE

### 👥 HR / Payroll
- [ ] Thêm nhân viên mới tại `/hr/employees`
- [ ] Tạo bảng lương tháng tại `/hr/payroll`
- [ ] Kiểm tra tính toán lương net (base + allowances - deductions)

### 🎁 Loyalty Program
- [ ] Tạo loyalty card cho khách hàng
- [ ] Cộng/trừ điểm thưởng
- [ ] Xem danh sách rewards catalog

### 🏭 Fixed Assets
- [ ] Thêm tài sản cố định mới
- [ ] Xem khấu hao tự động (straight-line)
- [ ] Thực hiện thanh lý tài sản

### 📋 Project Management
- [ ] Tạo project với budget và manager
- [ ] Thêm tasks và milestones
- [ ] Log time entry cho task

### 🛒 Omnichannel
- [ ] Kết nối store (Shopee/Lazada/TikTok)
- [ ] Đẩy tồn kho lên marketplace
- [ ] Xem sync logs

### 📦 Inventory nâng cao
- [ ] Tạo lot tracking cho sản phẩm
- [ ] Tạo warehouse transfer (draft → approved → shipped → received)
- [ ] Kiểm tra reorder suggestions

---

## Báo lỗi

Khi gặp lỗi, vui lòng cung cấp:

1. **Mô tả**: Bạn đang làm gì khi lỗi xảy ra
2. **Screenshot** hoặc thông báo lỗi
3. **Console logs** (F12 → Console trong trình duyệt)
4. **API logs**: `docker-compose logs api --tail=50`

Gửi báo cáo qua:
- GitHub Issues: https://github.com/smart-erp/smart-erp-next/issues
- Email: beta@smart-erp.vn

---

## Lệnh hữu ích

```bash
# Xem logs realtime
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f api
docker-compose logs -f web

# Restart một service
docker-compose restart api

# Dừng toàn bộ
docker-compose down

# Dừng và xóa database (reset hoàn toàn)
docker-compose down -v

# Cập nhật lên phiên bản mới
git pull
docker-compose up -d --build
```

---

## Câu hỏi thường gặp

**Q: Web hiện "Cannot connect to API"?**  
A: Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env` — phải là IP/domain mà trình duyệt của bạn có thể truy cập, không phải `http://api:3000`.

**Q: Build lỗi "out of memory"?**  
A: Tăng RAM cho Docker Desktop lên ít nhất 4 GB (Settings → Resources → Memory).

**Q: Port 3000/3001 đã bị dùng?**  
A: Đổi port trong `.env`: `API_PORT=3100`, `WEB_PORT=3101`.

**Q: Quên mật khẩu admin?**  
A: `docker-compose exec postgres psql -U smart_erp -c "UPDATE users SET password_hash='...' WHERE email='admin@demo.com'"`

---

*Smart ERP Next v0.4.0 — Beta Testing Guide*  
*Cập nhật: 2026-05-17*
