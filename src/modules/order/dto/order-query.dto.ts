import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'src/shared/enum/enum.type';

export class OrderQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Search by order number' })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
