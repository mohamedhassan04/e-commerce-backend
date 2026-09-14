import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StatsRange } from 'src/shared/enum/enum.type';

export class StatsQueryDto {
  @ApiPropertyOptional({
    enum: StatsRange,
    description: 'Time range in days',
    default: StatsRange.DAYS_30,
  })
  @IsOptional()
  @IsEnum(StatsRange)
  range?: StatsRange = StatsRange.DAYS_30;
}
