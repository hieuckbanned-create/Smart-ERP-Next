import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  async search(@Request() req: any, @Query('q') query: string, @Query('limit') limit?: string) {
    return this.service.search(req.user.tenantId, query, Number(limit) || 20);
  }

  @Get('autocomplete')
  async autocomplete(@Request() req: any, @Query('q') query: string, @Query('limit') limit?: string) {
    return this.service.autocomplete(req.user.tenantId, query, Number(limit) || 10);
  }
}