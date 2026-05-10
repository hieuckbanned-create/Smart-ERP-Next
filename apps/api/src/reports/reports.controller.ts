import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private parseDate(str: string | undefined, fallback: Date): Date {
    if (!str) return fallback;
    const d = new Date(str);
    return isNaN(d.getTime()) ? fallback : d;
  }

  private defaultRange() {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), 1); // start of month
    return { from, to };
  }

  @Get('revenue')
  getRevenue(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    const range = this.defaultRange();
    return this.reportsService.getRevenueReport(
      req.user.tenantId,
      this.parseDate(from, range.from),
      this.parseDate(to, range.to),
      (groupBy as 'day' | 'week' | 'month') ?? 'day'
    );
  }

  @Get('profit')
  getProfit(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range = this.defaultRange();
    return this.reportsService.getProfitReport(
      req.user.tenantId,
      this.parseDate(from, range.from),
      this.parseDate(to, range.to)
    );
  }

  @Get('top-products')
  getTopProducts(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const range = this.defaultRange();
    return this.reportsService.getTopProducts(
      req.user.tenantId,
      this.parseDate(from, range.from),
      this.parseDate(to, range.to),
      limit ? parseInt(limit) : 10
    );
  }

  @Get('inventory')
  getInventory(@Request() req: any) {
    return this.reportsService.getInventoryReport(req.user.tenantId);
  }

  @Get('customers')
  getCustomers(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range = this.defaultRange();
    return this.reportsService.getCustomerReport(
      req.user.tenantId,
      this.parseDate(from, range.from),
      this.parseDate(to, range.to)
    );
  }

  @Get('summary')
  getSummary(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const range = this.defaultRange();
    return this.reportsService.getSummary(
      req.user.tenantId,
      this.parseDate(from, range.from),
      this.parseDate(to, range.to)
    );
  }
}
