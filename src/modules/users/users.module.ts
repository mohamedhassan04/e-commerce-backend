import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { PhoneNumber } from './entities/phone-number.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Address, PhoneNumber])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
