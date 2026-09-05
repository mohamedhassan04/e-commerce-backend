import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateImageActiveDto {
  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'Whether the image is active',
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;
}
