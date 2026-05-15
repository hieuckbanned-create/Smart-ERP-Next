import { Controller, Get, Param } from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('product/:id')
  async getProductForecast(@Param('id') id: string) {
    const data = await this.forecastService.getMonthlyDemand(id);
    return { productId: id, data };
  }
}
