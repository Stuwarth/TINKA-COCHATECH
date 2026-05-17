import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  MinLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({
    example: '2 Empanadas de carne',
    description: 'Nombre del producto vendido',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  product_name: string;

  @ApiProperty({
    example: 10.0,
    description: 'Monto total de la venta en Bolivianos',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Efectivo',
    description: 'Método de pago (Efectivo, QR, Transferencia, Tarjeta)',
    enum: ['Efectivo', 'QR', 'Transferencia', 'Tarjeta'],
  })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiPropertyOptional({
    example: 'Tienda',
    description: 'Ubicación de la venta (Tienda, Feria, Delivery)',
    enum: ['Tienda', 'Feria', 'Delivery'],
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-negocio',
    description: 'ID del negocio (opcional si se usa header x-business-id)',
  })
  @IsString()
  @IsOptional()
  business_id?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Cantidad de productos vendidos',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    example: 'app',
    description: 'Origen del registro (app, whatsapp_audio, whatsapp_text)',
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    description: 'Mensaje original del usuario (para auditoría)',
  })
  @IsString()
  @IsOptional()
  raw_message?: string;
}
