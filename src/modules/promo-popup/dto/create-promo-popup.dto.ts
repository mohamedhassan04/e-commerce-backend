import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePromoPopupDto {
  @ApiPropertyOptional({
    type: 'string',
    example: 'Harvest sale — 20% off',
    description: 'Popup title',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Enjoy 20% off all olive oils this week.',
    description: 'Popup description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '/shop',
    description: 'Optional link opened when the CTA is clicked',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    example: true,
    description: 'Whether the popup is shown to visitors',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : value === 'true' || value === true,
  )
  isActive?: boolean;
}
