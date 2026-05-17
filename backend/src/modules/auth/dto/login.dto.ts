import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 dígitos' })
  pin: string;
}
