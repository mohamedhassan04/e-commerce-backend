import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Users } from 'src/modules/users/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Users, Product])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
