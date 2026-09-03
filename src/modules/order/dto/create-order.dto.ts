import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
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

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  zipCode: string;

  @ApiProperty({ example: 'USA' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phoneNumber: string;
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
}
