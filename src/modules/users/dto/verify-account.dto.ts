import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({ type: 'string', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail(
    { allow_display_name: true },
    { message: 'Please provide a valid email.' },
  )
  email: string;

  @ApiProperty({ type: 'string', example: 'abc123!@#' })
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
