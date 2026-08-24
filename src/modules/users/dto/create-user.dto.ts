import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    type: 'string',
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    type: 'string',
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsEmail(
    { allow_display_name: true },
    { message: 'Please provide a valid email.' },
  )
  email: string;

  @ApiProperty({
    type: 'string',
    example: 'P@ssw0rd!',
    description:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;
}
