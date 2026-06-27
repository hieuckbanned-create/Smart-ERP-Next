import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ForecastService } from './forecast.service';

@Controller('forecast')
@UseGuards(JwtAuthGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('product/:id')
  async getProductForecast(@Request() req: any, @Param('id') id: string) {
    const data = await this.forecastService.getMonthlyDemand(req.user.tenantId, id);
    return { productId: id, data };
  }
}
