import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    type: 'string',
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '123',
    description: 'Street number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  streetNumber?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'New York',
    description: 'City',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '10001',
    description: 'Zip code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: false,
    description: 'Whether this is the default address',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
