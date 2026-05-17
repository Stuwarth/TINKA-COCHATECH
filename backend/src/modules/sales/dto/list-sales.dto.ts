import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListSalesDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Fecha inicial del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Fecha final del período (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Límite de resultados (opcional)',
  })
  @IsOptional()
  limit?: number;
}
