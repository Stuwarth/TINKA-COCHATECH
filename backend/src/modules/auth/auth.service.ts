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

  /**
   * Login con phone + PIN
   * Busca el usuario por teléfono y compara el PIN
   */
  async login(loginDto: LoginDto) {
    // Buscar usuario por teléfono
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('phone', loginDto.phone)
      .eq('status', 'active');

    if (error || !users || users.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado. Verifica tu número de teléfono.');
    }

    // Comparar PIN entre los usuarios encontrados (en caso de haber números duplicados)
    const user = users.find((u: any) => u.pin === loginDto.pin);

    if (!user) {
      throw new UnauthorizedException('PIN incorrecto');
    }

    // Buscar el negocio del usuario
    const { data: business } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Generar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
      },
      business: business ? {
        id: business.id,
        name: business.name,
        category: business.category,
      } : null,
    };
  }

  /**
   * Registro completo: crea usuario + negocio en Supabase
   */
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

      // Enviar credenciales por WhatsApp (no bloquea si falla)
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
          phone: registerDto.phone,
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
