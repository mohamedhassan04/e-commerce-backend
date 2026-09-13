import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductSwaggerDto extends OmitType(UpdateProductDto, [
  'images',
] as const) {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'New product images to add (files)',
    required: false,
  })
  images?: any[];
}
