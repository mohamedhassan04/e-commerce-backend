import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreatePhoneNumberDto } from './create-phone-number.dto';

export class AddPhoneNumbersDto {
  @ApiProperty({
    type: [CreatePhoneNumberDto],
    description: 'Array of phone numbers to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneNumberDto)
  phoneNumbers: CreatePhoneNumberDto[];
}
