import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const CONTACT_TOPICS = [
  'order',
  'product',
  'wholesale',
  'other',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export class CreateContactDto {
  @ApiProperty({
    description: 'Name of the person sending the message',
    example: 'John Doe',
  })
  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Email address of the person sending the message',
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
    description: 'Topic of the message',
    enum: CONTACT_TOPICS,
    example: 'order',
  })
  @Transform(trim)
  @IsNotEmpty()
  @IsIn(CONTACT_TOPICS)
  topic: ContactTopic;

  @ApiProperty({
    description: 'Message body',
    example: 'I would like to know more about your olive oil.',
  })
  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({
    description: 'Language used by the sender',
    enum: ['cz', 'en'],
    example: 'en',
  })
  @IsOptional()
  @IsIn(['cz', 'en'])
  language?: 'cz' | 'en';
}
