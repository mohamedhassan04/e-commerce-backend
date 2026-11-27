import {
  Body,
  Controller,
  Get,
  Header,
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
import { ValidateCartStockDto } from './dto/validate-cart-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { Users } from '../users/entities/user.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { GuestOrderTrackingDto } from './dto/guest-order-tracking.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Place a new order (authenticated or guest)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order placed successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient stock.' })
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id?.id || null;
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({ summary: 'Get limited guest order status from a private email token' })
  @ApiNotFoundResponse({ description: 'Tracking link is invalid or expired.' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Header('Cache-Control', 'no-store, private')
  @Header('Referrer-Policy', 'no-referrer')
  @Post('guest-tracking')
  getGuestOrderTracking(@Body() dto: GuestOrderTrackingDto) {
    return this.orderService.getGuestOrderTracking(dto.token);
  }

  @ApiOperation({ summary: 'Check stock before changing cart quantity' })
  @Post('validate-stock')
  validateCartStock(@Body() dto: ValidateCartStockDto) {
    return this.orderService.validateCartStock(dto);
  }

  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string, @GetUser() user: Users) {
    return this.orderService.cancelOrder(id, user.id);
  }
}
