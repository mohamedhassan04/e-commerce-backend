import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class WithdrawQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    description: 'Search by customer name, email or order number',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
