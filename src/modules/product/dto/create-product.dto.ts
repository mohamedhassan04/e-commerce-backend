import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    type: 'string',
    example: '38',
    description: 'Custom size label for the variant',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  size: string;

  @ApiProperty({
    type: 'number',
    example: 29.99,
    description: 'Price for this variant',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    type: 'number',
    example: 100,
    description: 'Stock quantity for this variant',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    type: 'string',
    example: 'SHOE-38-BLK',
    description: 'Stock keeping unit for this variant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;
}

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
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({
    type: 'string',
    example: 'Classic Running Shoes',
    description: 'Name of the product',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Lightweight running shoes for everyday use',
    description: 'Description of the product',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: true,
    description: 'Whether the product is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [CreateProductVariantDto],
    description: 'Size variants for the product',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({
    type: [CreateProductImageDto],
    description: 'Product images',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

export class CreateProductSwaggerDto extends CreateProductDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images (files)',
  })
  images: any[];
}
