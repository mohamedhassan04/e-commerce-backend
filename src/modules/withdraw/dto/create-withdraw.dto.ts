import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateWithdrawDto {
  @ApiProperty({
    description: 'Full name of the customer withdrawing from the contract',
    example: 'John Doe',
  })
  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Email address used on the order',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Order number the withdrawal relates to',
    example: 'ORD-202611-A1B2C3',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  orderNumber: string;
}
