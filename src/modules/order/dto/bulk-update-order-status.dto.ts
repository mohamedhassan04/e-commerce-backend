import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderStatus } from 'src/shared/enum/enum.type';

export class BulkUpdateOrderStatusDto {
  @ApiProperty({
    description: 'Array of order IDs to update',
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];

  @ApiProperty({
    enum: OrderStatus,
    description: 'New order status for all selected orders',
    example: OrderStatus.CONFIRMED,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
