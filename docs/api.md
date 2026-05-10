# Smart ERP Next — API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

Tất cả endpoints (trừ auth) yêu cầu header:
```
Authorization: Bearer <access_token>
```

### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "tenantId": "uuid (optional)"
}
```

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "tenantId": "uuid",
    "role": "admin"
  }
}
```

---

## Products `/products`

### GET /products
Query params: `page`, `limit`, `search`, `categoryId`, `minPrice`, `maxPrice`, `isActive`

### GET /products/:id

### POST /products
```json
{
  "name": "Sản phẩm A",
  "sku": "SP-001",
  "price": 150000,
  "cost": 100000,
  "stock": 50,
  "minStock": 10,
  "unit": "piece",
  "description": "Mô tả sản phẩm",
  "isActive": true
}
```

### PATCH /products/:id

### DELETE /products/:id

### PATCH /products/:id/stock
```json
{
  "quantity": 10,
  "type": "IN",
  "notes": "Nhập hàng từ NCC"
}
```

---

## Customers `/customers`

### GET /customers
Query params: `page`, `limit`, `search`, `group`, `isActive`

### GET /customers/:id

### POST /customers
```json
{
  "code": "KH-001",
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "customer@example.com",
  "address": "123 Đường ABC",
  "district": "Quận 1",
  "province": "TP. Hồ Chí Minh",
  "customerGroup": "retail",
  "debtLimit": 5000000
}
```

### PATCH /customers/:id

### DELETE /customers/:id

---

## Orders `/orders`

### GET /orders
Query params: `page`, `limit`, `search`, `status`, `paymentStatus`, `channel`

### GET /orders/:id
Returns order with items array.

### POST /orders
```json
{
  "customerId": "uuid (optional)",
  "channel": "pos",
  "paymentMethod": "cash",
  "discountAmount": 50000,
  "shippingFee": 0,
  "notes": "Ghi chú đơn hàng",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 150000,
      "discountAmount": 0
    }
  ]
}
```

### PATCH /orders/:id/status
```json
{
  "status": "confirmed",
  "cancelReason": "Lý do hủy (nếu status = cancelled)"
}
```

Valid transitions:
- `draft` → `confirmed` | `cancelled`
- `confirmed` → `processing` | `cancelled`
- `processing` → `shipped` | `cancelled`
- `shipped` → `delivered` | `returned`

---

## Users `/users`

### GET /users
### GET /users/:id
### POST /users
### PATCH /users/:id
### DELETE /users/:id

---

## Tenants `/tenants`

### GET /tenants
### POST /tenants
### PATCH /tenants/:id

---

## Reports `/reports`

### GET /reports/revenue
Query: `from`, `to`, `groupBy` (day/week/month)

### GET /reports/inventory
### GET /reports/customers

---

## Insights `/insights`

### GET /insights/dashboard
Returns dashboard stats: todayRevenue, todayOrders, totalCustomers, lowStockCount, revenueChart, recentOrders, topProducts.

---

## Health Check

### GET /health
```json
{ "status": "ok", "timestamp": "2026-05-10T00:00:00.000Z" }
```

---

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Common status codes:
- `400` Bad Request — Validation error
- `401` Unauthorized — Missing/invalid token
- `403` Forbidden — Insufficient permissions
- `404` Not Found — Resource not found
- `409` Conflict — Duplicate code/SKU, CRDT conflict
- `500` Internal Server Error
