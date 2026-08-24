import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './auth.service';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { AuthenticationController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

/* If we import JwtModule, we don't need to import JwtService */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Users]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [AuthenticationService, UsersService, LocalStrategy, JwtStrategy],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
