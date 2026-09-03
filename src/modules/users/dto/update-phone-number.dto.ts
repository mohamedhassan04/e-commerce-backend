import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePhoneNumberDto {
  @ApiPropertyOptional({
    type: 'string',
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: false,
    description: 'Whether this is the default phone number',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
