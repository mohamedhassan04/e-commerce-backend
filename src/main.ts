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
import { join } from 'path';

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
  const frontendPath = configService.get<string>('FRONTEND_PATH');

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // Enable CORS before static assets so /uploads routes get CORS headers
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [frontendPath];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Serve static files from uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

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
