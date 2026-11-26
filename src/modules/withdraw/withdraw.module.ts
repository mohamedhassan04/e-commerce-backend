import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { Withdraw } from './entities/withdraw.entity';
import { Order } from '../order/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendMailModule } from 'src/shared/send-mail/send-mail.module';
import { WithdrawEmailListener } from './withdraw-email.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw, Order]), SendMailModule],
  controllers: [WithdrawController],
  providers: [WithdrawService, WithdrawEmailListener],
})
export class WithdrawModule {}
