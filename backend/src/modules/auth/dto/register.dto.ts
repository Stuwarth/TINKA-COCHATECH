import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'emprendedor@email.com',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  full_name: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '+59161234567',
    description: 'Número de teléfono con código de país',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '1234',
    description: 'PIN de 4 dígitos para operaciones rápidas',
    minLength: 4,
  })
  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 dígitos' })
  @IsNotEmpty()
  pin: string;

  @ApiProperty({
    example: 'Emporio de Juan',
    description: 'Nombre del negocio del emprendedor',
  })
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @ApiPropertyOptional({
    example: 'Comida',
    description: 'Categoría del negocio (Comida, Artesanía, Servicios, etc.)',
  })
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Venta de empanadas y jugos',
    description: 'Descripción breve del negocio',
  })
  @IsString()
  description?: string;
}
