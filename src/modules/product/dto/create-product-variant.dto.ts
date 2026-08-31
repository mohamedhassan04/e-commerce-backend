import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
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
  @Type(() => Number)
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
  @Type(() => Number)
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
