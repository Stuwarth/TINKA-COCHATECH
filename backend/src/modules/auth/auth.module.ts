import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { WhatsappService } from '../../common/services/whatsapp.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRATION as any) || '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WhatsappService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}



