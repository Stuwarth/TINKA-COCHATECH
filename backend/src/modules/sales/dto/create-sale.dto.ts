import { IsString, IsNumber, IsNotEmpty, IsPositive, MinLength } from 'class-validator';

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
  location?: string;
}

