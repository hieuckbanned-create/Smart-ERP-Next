import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

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