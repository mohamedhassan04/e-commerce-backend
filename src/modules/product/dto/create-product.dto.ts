import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { CreateProductImageDto } from './create-product-image.dto';

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
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Category ID to assign to the product',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [CreateProductVariantDto],
    description: 'Size variants for the product',
  })
  @Transform(({ value }) => {
    try {
      let parsed: unknown;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = JSON.parse('[' + value + ']');
        }
      } else {
        parsed = value;
      }
      const array = Array.isArray(parsed) ? parsed : [parsed];
      return array.map((v) => plainToInstance(CreateProductVariantDto, v));
    } catch (error) {
      throw new Error(
        `Invalid variants JSON: ${error as any}. Expected a JSON array of variant objects.`,
      );
    }
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
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

export class CreateProductSwaggerDto extends OmitType(CreateProductDto, [
  'images',
] as const) {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images (files)',
  })
  images: any[];
}
