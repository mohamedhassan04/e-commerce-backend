import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ValidateCartStockDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsNotEmpty()
  @IsString()
  productVariantId: string;

  @ApiProperty({ description: 'Requested cart quantity', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
