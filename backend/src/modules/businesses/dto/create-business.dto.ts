import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    example: 'Panadería Delicios',
    description: 'Nombre del negocio',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Panadería y repostería',
    description: 'Descripción del negocio',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Comida',
    description: 'Categoría del negocio',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: '+59161234567',
    description: 'Teléfono del negocio',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Calle Mercado #123',
    description: 'Dirección o ubicación del negocio',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
