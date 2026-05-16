import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { createClient } from '@supabase/supabase-js';
import { WhatsappService } from '../../common/services/whatsapp.service';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whatsappService: WhatsappService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

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
    try {
      // Crear usuario en Supabase
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert([
          {
            email: registerDto.email,
            full_name: registerDto.full_name,
            password_hash: registerDto.password, // TODO: Hash contraseña
            phone: registerDto.phone,
            pin: registerDto.pin,
            role: 'entrepreneur',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Crear el negocio del usuario
      const { data: businessData, error: businessError } = await this.supabase
        .from('businesses')
        .insert([
          {
            user_id: userData.id,
            name: registerDto.business_name,
            description: registerDto.description,
            category: registerDto.category,
            phone: registerDto.phone,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (businessError) {
        throw businessError;
      }

      // Generar token JWT
      const payload = {
        email: registerDto.email,
        sub: userData.id,
      };

      const token = this.jwtService.sign(payload);

      // Enviar credenciales por WhatsApp
      await this.whatsappService.sendCredentials(
        registerDto.phone,
        registerDto.email,
        token,
        registerDto.business_name,
      );

      return {
        access_token: token,
        user: {
          id: userData.id,
          email: registerDto.email,
          full_name: registerDto.full_name,
          pin: registerDto.pin,
        },
        business: {
          id: businessData.id,
          name: registerDto.business_name,
        },
      };
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}



