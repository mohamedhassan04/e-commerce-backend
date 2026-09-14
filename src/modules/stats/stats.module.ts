import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Users } from 'src/modules/users/entities/user.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Users])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
