import { IsOptional, IsDateString } from 'class-validator';

export class ListSalesDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  limit?: number;
}
