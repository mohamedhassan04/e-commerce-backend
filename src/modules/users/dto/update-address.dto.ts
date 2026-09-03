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
    example: 'New York',
    description: 'City',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'NY',
    description: 'State',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

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
    type: 'string',
    example: 'USA',
    description: 'Country',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: false,
    description: 'Whether this is the default address',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
