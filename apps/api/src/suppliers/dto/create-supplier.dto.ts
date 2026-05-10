import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  ward?: string;

  @IsOptional() @IsString()
  district?: string;

  @IsOptional() @IsString()
  province?: string;

  @IsOptional() @IsString()
  taxCode?: string;

  @IsOptional() @IsString()
  contactPerson?: string;

  @IsOptional() @IsString()
  bankAccount?: string;

  @IsOptional() @IsString()
  bankName?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
