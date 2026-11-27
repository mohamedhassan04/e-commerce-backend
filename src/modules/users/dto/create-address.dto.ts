import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    type: 'string',
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({
    type: 'string',
    example: '123',
    description: 'Street number',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  streetNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'New York',
    description: 'City',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    type: 'string',
    example: '10001',
    description: 'Zip code',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  zipCode: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'Whether this is the default address',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
