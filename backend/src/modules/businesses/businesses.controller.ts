import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear nuevo negocio',
    description: 'Crea un nuevo negocio asociado al usuario autenticado',
  })
  @ApiResponse({ status: 201, description: 'Negocio creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreateBusinessDto })
  async createBusiness(
    @Request() req,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    const userId = req.user.sub;
    return this.businessesService.createBusiness(userId, createBusinessDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener mis negocios',
    description: 'Lista todos los negocios asociados al usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Lista de negocios' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyBusinesses(@Request() req) {
    const userId = req.user.sub;
    return this.businessesService.getBusinessesByUser(userId);
  }
}
