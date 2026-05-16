import { Controller, Get, Post, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Finance Management')
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @ApiOperation({ summary: 'Get cashflow forecast for a period' })
  @Get('cashflow/forecast')
  getForecast(@Request() req: any, @Query('period') period: string) {
    return this.financeService.generateForecast(req.user.tenantId, period || 'Current');
  }

  @ApiOperation({ summary: 'List all budgets' })
  @Get('budgets')
  listBudgets(@Request() req: any) {
    return this.financeService.listBudgets(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Get budget variance analysis' })
  @Get('budgets/:id/variance')
  getBudgetVariance(@Request() req: any, @Param('id') id: string) {
    return this.financeService.getBudgetVariance(req.user.tenantId, id);
  }
}
