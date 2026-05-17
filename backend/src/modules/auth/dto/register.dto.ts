import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  full_name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 dígitos' })
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  business_name: string;

  @IsString()
  category?: string;

  @IsString()
  description?: string;
}
