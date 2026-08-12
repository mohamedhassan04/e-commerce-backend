import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { winstonLogger } from './shared/logger/logger.config';
import cookieParser from 'cookie-parser';
import createDatabaseIfNotExists from './config/create-database';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { setupSwagger } from './shared/swagger/setup';
import { configService as config } from './config/config.service';

async function bootstrap() {
  await createDatabaseIfNotExists();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

  // Use cookie-parser middleware
  app.use(cookieParser());

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Get port from environment variables
  const port = configService.get<number>('PORT');

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  app.use(helmet());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  //set global prefix for all routes
  app.setGlobalPrefix(config.apiPrefix);

  // swagger
  setupSwagger(app, config.swaggerConfig);

  // start server
  await app.listen(port);

  // log
  Logger.log(`Server is running on port ${port}`);
}
bootstrap();
