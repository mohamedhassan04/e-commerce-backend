import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class GuestOrderTrackingDto {
  @ApiProperty({
    description: 'High-entropy guest order tracking token from the confirmation email.',
    minLength: 43,
    maxLength: 43,
  })
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  token: string;
}