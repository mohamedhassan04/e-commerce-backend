import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePhoneNumberDto {
  @ApiProperty({
    type: 'string',
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'Whether this is the default phone number',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
