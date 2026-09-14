import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    type: 'string',
    description: 'Current password to confirm account deletion',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
