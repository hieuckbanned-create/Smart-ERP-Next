# AI Demand Forecasting API

**Purpose:** AI-powered inventory demand prediction using Facebook Prophet ML model to reduce stockouts and overstock situations.

## Architecture Overview

```
┌─────────────────┐    HTTP POST    ┌──────────────────────┐
│  NestJS API     │ ──────────────► │  Python AI Service   │
│  /forecast/*    │                 │  (apps/ai-forecast)  │
└─────────────────┘                 └──────────────────────┘
      │                                      │
      │                                      │
      ▼                                      ▼
┌─────────────────┐                 ┌──────────────────────┐
│  Frontend Web   │                 │  Facebook Prophet    │
│  Mobile App     │                 │  ML Model            │
└─────────────────┘                 └──────────────────────┘
```

## Endpoints

### 1. `GET /forecast/product/:id`

Get demand forecast for a specific product.

**Parameters:**
- `id` (path) – Product ID

**Response:**
```json
{
  "productId": "PROD-001",
  "data": {
    "predictions": [
      {"date": "2026-05-16", "quantity": 25},
      {"date": "2026-05-17", "quantity": 28}
    ],
    "suggestedOrder": 150,
    "confidenceLower": [
      {"date": "2026-05-16", "quantity": 20}
    ],
    "confidenceUpper": [
      {"date": "2026-05-16", "quantity": 32}
    ],
    "generatedAt": "2026-05-15T10:00:00Z",
    "isFallback": false
  }
}
```

### 2. `POST /inventory-recommendation/suggest`

Get AI-powered reorder suggestions based on current inventory levels.

**Request Body:**
```json
{
  "productId": "PROD-001",
  "currentStock": 50
}
```

**Response:**
```json
{
  "productId": "PROD-001",
  "shouldReorder": true,
  "currentStock": 50,
  "predictedDemandNext7d": 175,
  "predictedDemandNext30d": 720,
  "suggestedOrderQuantity": 845,
  "safetyStock": 75,
  "reorderPoint": 200,
  "daysUntilStockout": 3,
  "reasons": [
    "Current stock (50) is at or below reorder point (200)",
    "Stock will run out in 3 days (supplier lead time: 7 days)"
  ]
}
```

### 3. Python AI Service Endpoints (apps/ai-forecast/main.py)

**POST /forecast**
```json
{
  "product_id": "PROD-001",
  "sales_history": [
    {"date": "2026-05-01", "quantity": 20},
    {"date": "2026-05-02", "quantity": 25}
  ],
  "lookahead_days": 30
}
```

**POST /reorder-suggestion**
```json
{
  "product_id": "PROD-001",
  "sales_history": [...],
  "inventory": {
    "product_id": "PROD-001",
    "current_stock": 50,
    "supplier_lead_days": 7
  }
}
```

**GET /health**
```json
{
  "status": "healthy",
  "model_version": "prophet-v1",
  "timestamp": "2026-05-15T10:00:00Z"
}
```

## Configuration

**Environment Variables:**
- `AI_FORECAST_URL` – Python AI service URL (default: `http://localhost:8000`)
- `PORT` – Python service port (default: `8000`)

**AI Service Configuration (apps/ai-forecast/main.py):**
```python
AI_FORECAST_CONFIG = {
    "min_history_days": 7,
    "default_lookahead_days": 30,
    "reorder_lead_days": 7,
    "safety_stock_days": 3,
}
```

## Running the AI Service

```bash
cd apps/ai-forecast
pip install -r requirements.txt
python main.py
```

**requirements.txt dependencies:**
- fastapi
- uvicorn
- pandas
- prophet
- pydantic

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Insufficient data (< 7 days of history) |
| 404 | Product not found |
| 500 | AI service error / fallback mode |

## Fallback Behavior

When the Python AI service is unavailable, the NestJS API returns a simple linear growth pattern with `isFallback: true`. This ensures the application remains functional even when AI services are down.

## i18n Keys

All user-facing text uses i18n keys:
- `analytics.forecast.title` – "Dự báo nhu cầu" / "Demand Forecast"
- `analytics.forecast.table.predicted` – "Dự báo" / "Forecast"
- `inventory.shouldReorder` – "Cần nhập hàng ngay" / "Needs Immediate Reorder"
- `inventory.daysUntilStockout` – "ngày đến khi hết hàng" / "days until stockout"

## Files

| File | Purpose |
|------|---------|
| `apps/api/src/forecast/` | NestJS forecast service and controller |
| `apps/api/src/inventory-recommendation/` | Reorder suggestion service |
| `apps/ai-forecast/main.py` | Python FastAPI Prophet ML service |
| `apps/web/src/app/analytics/forecast/page.tsx` | Web analytics dashboard |
| `apps/web/src/app/forecast/dashboard/page.tsx` | Web forecast dashboard |
| `apps/mobile/src/screens/ForecastScreen.tsx` | Mobile forecast screen |
| `apps/mobile/src/screens/ForecastAndRecommendationScreen.tsx` | Mobile reorder UI |

*Last updated: 2026-05-15*