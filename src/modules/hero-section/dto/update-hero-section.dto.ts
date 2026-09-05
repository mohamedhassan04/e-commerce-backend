import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHeroSectionDto {
  @ApiPropertyOptional({
    type: 'string',
    example: 'Summer Sale Collection',
    description: 'Main slogan for the hero section',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slogan?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Up to 50% off on all items',
    description: 'Sub slogan for the hero section',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subSlogan?: string;
}
