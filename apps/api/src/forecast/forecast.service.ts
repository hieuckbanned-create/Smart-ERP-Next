import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastService {
  async getMonthlyDemand(productId: string) {
    return this.computeForecast(productId);
  }

  private computeForecast(productId: string) {
    const today = new Date();
    const salesHistory = this.generateSalesHistory();
    const avg = salesHistory.reduce((s, v) => s + v, 0) / salesHistory.length;
    const trend = (salesHistory[salesHistory.length - 1] - salesHistory[0]) / salesHistory.length;

    const predictions = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seasonal = isWeekend ? 0.7 : 1.0;
      const quantity = Math.round(Math.max(0, (avg + trend * (i + 1)) * seasonal));
      return { date: date.toISOString().split('T')[0], quantity };
    });

    const suggestedOrder = predictions.slice(0, 7).reduce((s, p) => s + p.quantity, 0);

    return {
      productId,
      predictions,
      suggestedOrder,
      confidenceLower: predictions.map((p) => ({
        date: p.date, quantity: Math.max(0, Math.round(p.quantity * 0.7)),
      })),
      confidenceUpper: predictions.map((p) => ({
        date: p.date, quantity: Math.round(p.quantity * 1.3),
      })),
      source: 'builtin',
      lookaheadDays: 30,
      generatedAt: new Date().toISOString(),
    };
  }

  private generateSalesHistory(): number[] {
    return Array.from({ length: 60 }, () => Math.floor(10 + Math.random() * 20));
  }
}
