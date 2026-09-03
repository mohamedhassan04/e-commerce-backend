import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
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
  resetCode: string;

  @ApiProperty({ type: 'string', example: 'NewP@ssw0rd!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
