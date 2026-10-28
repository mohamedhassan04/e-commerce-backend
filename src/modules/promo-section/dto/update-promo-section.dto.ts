import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePromoSectionDto {
  @IsOptional()
  @Transform(({ value }) => {
    try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return undefined; }
  })
  @IsObject()
  translations?: Record<string, Record<string, string | null>>;
  @ApiPropertyOptional({ type: 'string', example: 'Harvest drop — limited batch' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Cold-pressed oils, back for 72 hours only.' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Shop the drop' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string;

  @ApiPropertyOptional({ type: 'string', example: '/shop' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional({ type: 'string', example: '2026-12-31T18:00:00.000Z' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  endAt?: string;

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
