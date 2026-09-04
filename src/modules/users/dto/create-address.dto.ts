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

  @ApiPropertyOptional({
    type: 'string',
    example: 'Apt 4B',
    description: 'Apt / suite',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  apt?: string;

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
    example: 'NY',
    description: 'State',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  state: string;

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
    type: 'string',
    example: 'USA',
    description: 'Country',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

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
