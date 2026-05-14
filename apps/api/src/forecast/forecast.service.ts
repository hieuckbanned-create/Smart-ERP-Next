import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Simple placeholder AI forecasting service.
 * In a real implementation this would call an external model or ML service.
 */
@Injectable()
export class ForecastService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Return dummy monthly demand data for a product.
   * @param productId ID of the product to forecast
   * @returns Array of { month: string, demand: number }
   */
  async getMonthlyDemand(productId: string) {
    // Placeholder: generate a simple linear growth pattern.
    const base = 100;
    return Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }),
      demand: base + i * 20,
    }));
  }
}
