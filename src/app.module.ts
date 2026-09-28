import { Module } from '@nestjs/common';
import { AllModules } from './shared/modules';
import { APP_GUARD } from '@nestjs/core';
import { configService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
      envFilePath: '.env', // Specify the .env file path
    }),
    TypeOrmModule.forRootAsync({
      // Resolved when the module initializes, i.e. after the database
      // connection has been probed for TLS support in main.ts
      useFactory: () => configService.getTypeOrmConfig(),
    }),
    MailerModule.forRoot(configService.smtpEmailConfig()),
    ThrottlerModule.forRoot(configService.getThrottlerConfig()),
    ...AllModules,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
