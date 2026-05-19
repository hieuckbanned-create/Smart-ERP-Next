import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class BomItemResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  componentProductId: string;

  @ApiProperty()
  componentProductName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  unitCost?: number;

  @ApiProperty({ required: false })
  wastagePercent?: number;
}

export class ProductionOrderResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderCode: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ enum: ['draft', 'in_progress', 'completed', 'cancelled'] })
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  bomItems?: BomItemResponse[];
}

export class QCCheckpointResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['pending', 'passed', 'failed'] })
  status: 'pending' | 'passed' | 'failed';

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  checkedAt?: string;
}

export class CostBreakdownDto {
  @ApiProperty()
  component: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  unitCost?: number;

  @ApiProperty()
  subtotal: number;
}

export class ProductionCostResponse {
  @ApiProperty()
  totalMaterialCost: number;

  @ApiProperty()
  unitCost: number;

  @ApiProperty({ type: [CostBreakdownDto] })
  breakdown: CostBreakdownDto[];
}