import { IsString, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'US Dollar' })
  @IsString()
  name: string;

  @ApiProperty({ example: '$' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  decimalPlaces?: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isBaseCurrency?: boolean;
}
