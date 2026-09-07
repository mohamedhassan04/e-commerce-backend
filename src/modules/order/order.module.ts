import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { SendMailModule } from 'src/shared/send-mail/send-mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderShippingAddress]),
    SendMailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
