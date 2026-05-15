import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { LoyaltyService } from '../services/loyalty.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('cards')
  createCard(@Request() req: any, @Body('customerId', ParseIntPipe) customerId: number) {
    return this.loyaltyService.createLoyaltyCard(req.user.tenantId, customerId);
  }

  @Get('cards/:customerId')
  getCard(@Request() req: any, @Param('customerId', ParseIntPipe) customerId: number) {
    return this.loyaltyService.getLoyaltyCard(req.user.tenantId, customerId);
  }

  @Post('earn')
  earnPoints(
    @Request() req: any,
    @Body('customerId', ParseIntPipe) customerId: number,
    @Body('points', ParseIntPipe) points: number,
    @Body('referenceId') referenceId: string,
    @Body('description') description: string,
  ) {
    return this.loyaltyService.earnPoints(req.user.tenantId, customerId, points, referenceId, description);
  }

  @Post('redeem')
  redeemPoints(
    @Request() req: any,
    @Body('customerId', ParseIntPipe) customerId: number,
    @Body('points', ParseIntPipe) points: number,
    @Body('referenceId') referenceId: string,
    @Body('description') description: string,
  ) {
    return this.loyaltyService.redeemPoints(req.user.tenantId, customerId, points, referenceId, description);
  }

  @Get('rewards')
  getRewards(@Request() req: any) {
    return this.loyaltyService.getRewards(req.user.tenantId);
  }

  @Get('transactions/:customerId')
  getTransactions(
    @Request() req: any,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loyaltyService.getTransactionHistory(req.user.tenantId, customerId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}