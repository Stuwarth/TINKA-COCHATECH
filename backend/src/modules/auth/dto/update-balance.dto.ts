import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceDto {
  @ApiProperty({
    example: 100.0,
    description: 'Saldo inicial del usuario en Bolivianos',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  initial_balance: number;
}
