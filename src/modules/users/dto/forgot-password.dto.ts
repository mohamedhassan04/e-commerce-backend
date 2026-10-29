import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @ApiPropertyOptional({ enum: ['cz', 'en'], description: 'Language for the reset email' })
  @IsOptional()
  @IsIn(['cz', 'en'])
  language?: 'cz' | 'en';

  @ApiProperty({ type: 'string', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail(
    { allow_display_name: true },
    { message: 'Please provide a valid email.' },
  )
  email: string;
}
