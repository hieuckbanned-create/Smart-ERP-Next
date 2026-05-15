import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBomItemDto {
  @ApiProperty({ description: 'Product ID containing this component' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Component product ID' })
  @IsString()
  @IsNotEmpty()
  componentProductId: string;

  @ApiProperty({ description: 'Quantity of component required' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit cost of the component' })
  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Wastage percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wastagePercent?: number;
}

export class CreateProductionOrderDto {
  @ApiProperty({ description: 'Product ID to manufacture' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity to produce' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Planned start date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Planned end date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdateQCCheckpointDto {
  @ApiProperty({
    description: 'Status of the checkpoint',
    enum: ['pending', 'passed', 'failed'],
  })
  @IsString()
  status: 'pending' | 'passed' | 'failed';

  @ApiPropertyOptional({ description: 'Notes about the QC checkpoint' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CalculateCostDto {
  @ApiProperty({ description: 'Product ID to calculate cost for' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity to produce' })
  @IsInt()
  @Min(1)
  quantity: number;
}