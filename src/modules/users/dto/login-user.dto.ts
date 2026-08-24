import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    type: 'string',
    example: 'hassenmohamed.92@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail(
    { allow_display_name: true },
    { message: 'Please provide valid Email.' },
  )
  email: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  password: string;
}
