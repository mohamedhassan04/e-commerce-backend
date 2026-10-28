import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ContentTranslations, parseTranslations } from 'src/shared/utils/translations';

export class UpdateHeroSlideDto {
  @IsOptional()
  @Transform(({ value }) => parseTranslations(value))
  @IsObject()
  translations?: ContentTranslations;
  @ApiPropertyOptional({
    type: 'string',
    example: 'Summer harvest · Fresh-pressed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tag?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Good things,' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headline1?: string;

  @ApiPropertyOptional({ type: 'string', example: 'made slowly.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headline2?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Early-harvest olive oil…' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Free shipping over $60' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chip1?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Grower-direct' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chip2?: string;

  @ApiPropertyOptional({ type: 'integer', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ type: 'boolean', example: true })
  @IsOptional()
  isActive?: boolean;
}
