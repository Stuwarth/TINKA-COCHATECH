import { IsDateString, IsOptional } from 'class-validator';

export class ReportRangeDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  userId?: string;
}

