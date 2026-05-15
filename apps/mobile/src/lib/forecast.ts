/**
 * Mobile forecast API client.
 * Exports typed helpers for forecast and reorder suggestion endpoints.
 */
import { api } from './api';

/**
 * Daily demand prediction from AI forecast.
 */
export interface DailyDemand {
  date: string;      // YYYY-MM-DD
  quantity: number;  // Predicted daily demand
}

/**
 * AI forecast response structure matching Python Prophet model output.
 */
export interface ForecastResponse {
  productId: string;
  predictions: DailyDemand[];
  suggestedOrder: number;
  confidenceLower: DailyDemand[];
  confidenceUpper: DailyDemand[];
  generatedAt: string;
  isFallback?: boolean;
}

/**
 * Reorder suggestion response with inventory-aware calculations.
 */
export interface ReorderResponse {
  productId: string;
  shouldReorder: boolean;
  currentStock: number;
  predictedDemandNext7d: number;
  predictedDemandNext30d: number;
  suggestedOrderQuantity: number;
  safetyStock: number;
  reorderPoint: number;
  daysUntilStockout: number | null;
  reasons: string[];
}

/**
 * Monthly aggregated demand for backward compatibility.
 */
export interface MonthlyDemand {
  month: string;
  demand: number;
}

/**
 * Legacy recommendation response (kept for compatibility).
 */
export interface RecommendationResponse {
  productId: string;
  suggestedReorder: number;
}

export const forecastApi = {
  /**
   * Fetch AI-driven demand forecast for a product.
   * Uses Python Prophet ML model via NestJS API.
   */
  getMonthlyDemand: (productId: string) =>
    api.get<{ productId: string; data: ForecastResponse }>(`/forecast/product/${productId}`),

  /**
   * Fetch AI-driven reorder suggestion based on current inventory.
   * Considers forecasted demand vs current stock levels.
   */
  getReorderSuggestion: (productId: string, currentStock: number) =>
    api.post<ReorderResponse>('/forecast/reorder', {
      productId,
      currentStock,
    }),

  /**
   * Fetch legacy recommendation for backward compatibility.
   * @deprecated Use getReorderSuggestion for inventory-aware suggestions.
   */
  getRecommendation: (productId: string, currentStock: number) =>
    api.get<RecommendationResponse>(
      `/inventory-recommendation/suggest?productId=${encodeURIComponent(productId)}&stock=${currentStock}`
    ),
};