import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class AddAddressesDto {
  @ApiProperty({
    type: [CreateAddressDto],
    description: 'Array of addresses to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];
}
