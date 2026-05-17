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
      throw new UnauthorizedException(
        'Usuario no encontrado. Verifica tu número de teléfono.',
      );
    }

    // Comparar PIN cifrado entre los usuarios encontrados (en caso de haber números duplicados)
    const matchedUsers = await Promise.all(
      users.map(async (user: any) => ({
        user,
        isValidPin: await bcrypt.compare(loginDto.pin, user.pin),
      })),
    );

    const userEntry = matchedUsers.find((entry) => entry.isValidPin);
    const user = userEntry?.user;

    if (!user) {
      throw new UnauthorizedException('PIN incorrecto');
    }

    // Buscar el negocio del usuario
    const { data: business } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
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
        initial_balance: user.initial_balance,
        current_balance: user.current_balance,
      },
      business: business
        ? {
            id: business.id,
            name: business.name,
            category: business.category,
            status: business.status,
            whatsapp_phone: business.whatsapp_phone,
          }
        : null,
      whatsapp_link:
        business && business.status === 'pending' && business.activation_token
          ? this.whatsappService.buildActivationLink(
              business.activation_token,
              business.name,
            )
          : null,
    };
  }

  /**
   * Registro completo: crea usuario + negocio en Supabase
   */
  async register(registerDto: RegisterDto) {
    try {
      // Hash del password y del PIN con bcrypt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);
      const pinHash = await bcrypt.hash(registerDto.pin, saltRounds);

      // Crear usuario en Supabase
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert([
          {
            email: registerDto.email,
            full_name: registerDto.full_name,
            password_hash: passwordHash,
            phone: registerDto.phone,
            pin: pinHash,
            role: 'entrepreneur',
            status: 'active',
            initial_balance: 0,
            current_balance: 0,
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

      // Construir el enlace de activación de WhatsApp
      const whatsappLink = this.whatsappService.buildActivationLink(
        activationToken,
        registerDto.business_name,
      );

      // Enviar mensaje de bienvenida y activación por WhatsApp (no bloquea si falla)
      const welcomeMessage =
        `¡Hola ${registerDto.full_name}! 👋\n\n` +
        `¡Gracias por registrarte en Tinka! Tu negocio *${registerDto.business_name}* ha sido creado con éxito. 🚀\n\n` +
        `Para activar tu integración de WhatsApp y comenzar a registrar tus ventas con Inteligencia Artificial, por favor haz clic en el siguiente enlace y envía el mensaje de activación:\n\n` +
        `👉 ${whatsappLink}\n\n` +
        `O si prefieres, envía directamente el siguiente mensaje al bot:\n` +
        `*ACTIVAR:${activationToken}:${registerDto.business_name}*`;

      await this.whatsappService.sendMessage(registerDto.phone, welcomeMessage);

      this.logger.log(
        `Negocio registrado: ${registerDto.business_name} | Token: ${activationToken} | Link: ${whatsappLink}`,
      );

      return {
        access_token: token,
        user: {
          id: userData.id,
          email: registerDto.email,
          full_name: registerDto.full_name,
          phone: registerDto.phone,
          initial_balance: userData.initial_balance,
          current_balance: userData.current_balance,
        },
        business: {
          id: businessData.id,
          name: registerDto.business_name,
          status: 'pending',
          activation_token: activationToken,
        },
        whatsapp_link: whatsappLink,
      };
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Error en registro: ${message}`);
    }
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateBalance(userId: string, initialBalance: number) {
    try {
      // Calculamos la diferencia por si ya había ventas (opcional, pero lo más simple es resetear o setear la base).
      // Lo más sencillo: El current_balance se actualiza en la base de la diferencia, pero por ahora solo actualizamos ambos a initial_balance (asumiendo que inicia su turno).
      const { data, error } = await this.supabase
        .from('users')
        .update({
          initial_balance: initialBalance,
          current_balance: initialBalance,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar balance: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Error en updateBalance: ${message}`);
    }
  }
}
