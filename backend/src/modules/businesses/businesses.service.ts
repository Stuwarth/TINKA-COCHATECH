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
      process.env.SUPABASE_KEY || '',
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
            status: 'active',
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
        .eq('user_id', userId)
        .eq('status', 'active');

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
}


