import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { createClient } from '@supabase/supabase-js';
import { WhatsappService } from '../../common/services/whatsapp.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private supabase;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly whatsappService: WhatsappService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
    );
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', loginDto.email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // Hash del password con bcrypt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

      // Crear usuario en Supabase
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert([
          {
            email: registerDto.email,
            full_name: registerDto.full_name,
            password_hash: passwordHash,
            phone: registerDto.phone,
            pin: registerDto.pin,
            role: 'entrepreneur',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (userError) {
        this.logger.error(`Error creando usuario: ${userError.message}`);
        throw userError;
      }

      // Generar token de activación para vincular WhatsApp
      const activationToken = crypto.randomUUID().slice(0, 8).toUpperCase();
      const activationExpiresAt = new Date();
      activationExpiresAt.setHours(activationExpiresAt.getHours() + 24);

      // Crear el negocio con status 'pending' (se activa al vincular WhatsApp)
      const { data: businessData, error: businessError } = await this.supabase
        .from('businesses')
        .insert([
          {
            user_id: userData.id,
            name: registerDto.business_name,
            description: registerDto.description,
            category: registerDto.category,
            phone: registerDto.phone,
            activation_token: activationToken,
            activation_expires_at: activationExpiresAt.toISOString(),
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (businessError) {
        this.logger.error(`Error creando negocio: ${businessError.message}`);
        throw businessError;
      }

      // Generar token JWT
      const payload = {
        email: registerDto.email,
        sub: userData.id,
      };

      const token = this.jwtService.sign(payload);

      // Construir el link de WhatsApp para activación
      const whatsappLink = this.whatsappService.buildActivationLink(
        activationToken,
        registerDto.business_name,
      );

      this.logger.log(
        `Negocio registrado: ${registerDto.business_name} | Token: ${activationToken} | Link: ${whatsappLink}`,
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
          status: 'pending',
          activation_token: activationToken,
        },
        whatsapp_link: whatsappLink,
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
