import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContentTranslations, parseTranslations } from 'src/shared/utils/translations';

export class CreateHeroSlideDto {
  @IsOptional()
  @Transform(({ value }) => parseTranslations(value))
  @IsObject()
  translations?: ContentTranslations;
  @ApiProperty({
    type: 'string',
    example: 'Summer harvest · Fresh-pressed',
    description: 'Tag line for the slide',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  tag: string;

  @ApiProperty({
    type: 'string',
    example: 'Good things,',
    description: 'First line of the headline',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  headline1: string;

  @ApiProperty({
    type: 'string',
    example: 'made slowly.',
    description: 'Second line of the headline (displayed in accent color)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  headline2: string;

  @ApiProperty({
    type: 'string',
    example: 'Early-harvest olive oil, pantry staples...',
    description: 'Body text for the slide',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Free shipping over $60',
    description: 'First chip text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chip1?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Grower-direct',
    description: 'Second chip text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chip2?: string;
}
