import { IsString, IsNumber, IsNotEmpty, IsPositive, MinLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  product_name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  business_id?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  raw_message?: string;
}
