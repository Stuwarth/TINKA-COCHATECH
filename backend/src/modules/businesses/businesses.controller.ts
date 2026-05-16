import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBusiness(
    @Request() req,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    const userId = req.user.sub;
    return this.businessesService.createBusiness(userId, createBusinessDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyBusinesses(@Request() req) {
    const userId = req.user.sub;
    return this.businessesService.getBusinessesByUser(userId);
  }
}

