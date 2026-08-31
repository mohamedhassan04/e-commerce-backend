import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RateProductDto {
  @ApiProperty({
    type: 'number',
    example: 4.5,
    minimum: 1,
    maximum: 5,
    description: 'Rating value between 1 and 5',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;
}
