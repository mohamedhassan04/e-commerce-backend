import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateOrderStatusDto } from './dto/bulk-update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { Users } from '../users/entities/user.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { Request } from 'express';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Place a new order (authenticated or guest)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order placed successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient stock.' })
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id?.id || null;
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully.' })
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findMyOrders(@Query() query: ProductQueryDto, @GetUser() user: Users) {
    return this.orderService.findUserOrders(user.id, query);
  }

  @ApiOperation({ summary: 'Get all orders (admin)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all')
  findAllOrders(@Query() query: OrderQueryDto) {
    return this.orderService.findAllOrders(query);
  }

  @ApiOperation({ summary: 'Bulk update order status (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Orders status updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('bulk-status')
  bulkUpdateOrderStatus(@Body() dto: BulkUpdateOrderStatusDto) {
    return this.orderService.bulkUpdateOrderStatus(dto);
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOrderById(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @ApiOperation({ summary: 'Update order status (admin)' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto);
  }

  @ApiOperation({ summary: 'Cancel pending order' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string, @GetUser() user: Users) {
    return this.orderService.cancelOrder(id, user.id);
  }
}
