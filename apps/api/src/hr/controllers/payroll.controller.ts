import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayrollService } from '../services/payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payroll')
@Controller('hr/payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @ApiOperation({ summary: 'List all salary boards' })
  @Get('boards')
  listBoards(@Request() req: any) {
    return this.service.listBoards(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Auto-generate salary board from attendance' })
  @Post('boards/generate')
  generateBoard(@Request() req: any, @Body() body: { month: number; year: number }) {
    return this.service.generateSalaryBoard(req.user.tenantId, req.user.sub, body.month, body.year);
  }

  @ApiOperation({ summary: 'Get payslips for a board' })
  @Get('boards/:boardId/payslips')
  getPayslips(@Request() req: any, @Param('boardId') boardId: string) {
    return this.service.getPayslips(req.user.tenantId, boardId);
  }

  @ApiOperation({ summary: 'Approve a salary board' })
  @Patch('boards/:boardId/approve')
  approveBoard(@Request() req: any, @Param('boardId') boardId: string) {
    return this.service.approveBoard(req.user.tenantId, boardId);
  }
}
