import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    type: 'string',
    example: 'https://example.com/image.jpg',
    description: 'URL of the product image',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Black shoe front view',
    description: 'Alternative text for the image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: true,
    description: 'Whether this is the primary image',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPrimary?: boolean;
}
