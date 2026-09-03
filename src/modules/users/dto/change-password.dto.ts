import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ type: 'string', example: 'OldP@ssw0rd!' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ type: 'string', example: 'NewP@ssw0rd!', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
