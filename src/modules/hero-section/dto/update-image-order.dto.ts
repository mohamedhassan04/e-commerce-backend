import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateImageOrderDto {
  @ApiProperty({
    type: 'integer',
    example: 1,
    description: 'New display order for the image',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  displayOrder: number;
}
