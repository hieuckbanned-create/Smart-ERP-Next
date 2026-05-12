import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateChartOfAccountDto, UpdateChartOfAccountDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('accounting/accounts')
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateChartOfAccountDto) {
    return this.chartOfAccountsService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.chartOfAccountsService.findAll(req.user.tenantId, {
      type,
      isActive: isActive === 'true',
      search,
    });
  }

  @Get('tree')
  getTree(@Request() req: any) {
    return this.chartOfAccountsService.getAccountTree(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.chartOfAccountsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChartOfAccountDto,
  ) {
    return this.chartOfAccountsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.chartOfAccountsService.delete(req.user.tenantId, id);
  }

  @Post('seed')
  seedDefaultAccounts(@Request() req: any) {
    return this.chartOfAccountsService.seedDefaultAccounts(req.user.tenantId);
  }
}
