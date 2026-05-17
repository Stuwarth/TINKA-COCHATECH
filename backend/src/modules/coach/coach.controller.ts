import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coach')
@UseGuards(JwtAuthGuard)
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('chat')
  async chat(@Request() req, @Body('message') message: string) {
    const userId = req.user.sub; // sub holds the user id in standard JWT
    const reply = await this.coachService.getChatResponse(userId, message);
    return { reply };
  }
}
