import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePromoPopupDto {
  @IsOptional()
  @Transform(({ value }) => {
    try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return undefined; }
  })
  @IsObject()
  translations?: Record<string, Record<string, string | null>>;
  @ApiPropertyOptional({ type: 'string', example: 'Harvest sale — 20% off' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Enjoy 20% off all olive oils this week.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: 'string', example: '/shop' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional({ type: 'boolean', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : value === 'true' || value === true,
  )
  isActive?: boolean;
}
