import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: '+59161234567',
    description: 'Número de teléfono registrado',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '1234',
    description: 'PIN de 4 dígitos',
    minLength: 4,
  })
  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 dígitos' })
  pin: string;
}
