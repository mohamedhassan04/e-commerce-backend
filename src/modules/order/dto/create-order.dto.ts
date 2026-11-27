import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product variant ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  productVariantId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ManualAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  streetNumber: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  zipCode: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;
}

@ValidatorConstraint({ name: 'AddressValidation', async: false })
export class AddressValidationConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return true;
  }

  defaultMessage() {
    return '';
  }
}

@ValidatorConstraint({ name: 'PhoneNumberValidation', async: false })
export class PhoneNumberValidationConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return true;
  }

  defaultMessage() {
    return '';
  }
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Language used for order emails',
    enum: ['cz', 'en'],
    default: 'en',
  })
  @IsOptional()
  @IsIn(['cz', 'en'])
  language?: 'cz' | 'en';

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Order items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Saved address ID (use if user has saved addresses)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({
    type: ManualAddressDto,
    description: 'Manual address (use if user enters address manually)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ManualAddressDto)
  manualAddress?: ManualAddressDto;

  @ApiPropertyOptional({
    description: 'Saved phone number ID (use if user has saved phone numbers)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsString()
  phoneNumberId?: string;

  @ApiPropertyOptional({
    description: 'Manual phone number (use if the user enters a phone number manually)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Guest email (required for guest checkout)',
    example: 'guest@example.com',
  })
  @IsOptional()
  @IsString()
  guestEmail?: string;

  @ApiPropertyOptional({
    description: 'Guest first name (required for guest checkout)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  guestFirstName?: string;

  @ApiPropertyOptional({
    description: 'Guest last name (required for guest checkout)',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  guestLastName?: string;
}
