import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContentTranslations } from 'src/shared/utils/translations';

export class CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'Shoes',
    description: 'Name of the category',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsObject()
  translations?: ContentTranslations;

  @ApiPropertyOptional({
    type: 'boolean',
    example: true,
    description: 'Whether the category is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
