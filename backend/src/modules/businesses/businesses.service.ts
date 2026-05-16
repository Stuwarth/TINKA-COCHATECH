import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessesService {
  private supabase;
  private readonly logger = new Logger(BusinessesService.name);

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
    );
  }

  async createBusiness(
    userId: string,
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .insert([
          {
            user_id: userId,
            name: createBusinessDto.name,
            description: createBusinessDto.description,
            category: createBusinessDto.category,
            phone: createBusinessDto.phone,
            location: createBusinessDto.location,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error(`Error al crear negocio: ${error.message}`);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error en createBusiness: ${error.message}`);
      throw error;
    }
  }

  async getBusinessesByUser(userId: string): Promise<Business[]> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        this.logger.error(`Error al obtener negocios: ${error.message}`);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Error en getBusinessesByUser: ${error.message}`);
      throw error;
    }
  }

  async getBusinessById(businessId: string): Promise<Business | null> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) {
        this.logger.error(`Error al obtener negocio: ${error.message}`);
        throw error;
      }

      return data || null;
    } catch (error) {
      this.logger.error(`Error en getBusinessById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca un negocio por su token de activación (usado en el flujo de WhatsApp).
   */
  async findByActivationToken(token: string): Promise<Business | null> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('activation_token', token)
        .eq('status', 'pending')
        .single();

      if (error) {
        this.logger.warn(`Token de activación no encontrado: ${token}`);
        return null;
      }

      return data || null;
    } catch (error) {
      this.logger.error(`Error en findByActivationToken: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca un negocio por el número de WhatsApp vinculado.
   * Solo retorna negocios activos.
   */
  async findByWhatsAppPhone(phone: string): Promise<Business | null> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');

      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('whatsapp_phone', cleanPhone)
        .eq('status', 'active')
        .single();

      if (error) {
        return null;
      }

      return data || null;
    } catch (error) {
      this.logger.error(`Error en findByWhatsAppPhone: ${error.message}`);
      return null;
    }
  }

  /**
   * Activa un negocio vinculando un número de WhatsApp.
   * Cambia status a 'active' y guarda el número.
   */
  async activateBusiness(businessId: string, whatsappPhone: string): Promise<Business> {
    const cleanPhone = whatsappPhone.replace(/\D/g, '');

    const { data, error } = await this.supabase
      .from('businesses')
      .update({
        whatsapp_phone: cleanPhone,
        status: 'active',
        activation_token: null,
        activation_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error al activar negocio: ${error.message}`);
      throw error;
    }

    this.logger.log(`Negocio ${businessId} activado con WhatsApp: ${cleanPhone}`);
    return data;
  }
}
