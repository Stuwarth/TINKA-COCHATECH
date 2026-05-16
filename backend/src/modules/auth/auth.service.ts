import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // TODO: Validar contra Supabase
    // Por ahora, retornar un token de ejemplo
    const payload = {
      email: loginDto.email,
      sub: 'user-id-123',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: 'user-id-123',
        email: loginDto.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // TODO: Crear usuario en Supabase
    // Por ahora, retornar un token de ejemplo
    const payload = {
      email: registerDto.email,
      sub: 'user-id-123',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: 'user-id-123',
        email: registerDto.email,
        full_name: registerDto.full_name,
      },
    };
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

