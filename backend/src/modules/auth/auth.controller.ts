import {
  Controller,
  Post,
  Body,
  Patch,
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
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una nueva cuenta de usuario en el sistema. Retorna el usuario creado y el token JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna un token JWT para acceder a las endpoints protegidos.',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('balance')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar saldo inicial',
    description:
      'Actualiza el saldo inicial del usuario. Requiere autenticación JWT.',
  })
  @ApiResponse({ status: 200, description: 'Saldo actualizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: UpdateBalanceDto })
  async updateBalance(
    @Request() req,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    return this.authService.updateBalance(
      req.user.sub,
      updateBalanceDto.initial_balance,
    );
  }
}
