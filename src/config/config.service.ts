// Import the TypeOrmModuleOptions from the NestJS TypeORM module
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ISwaggerConfigInterface } from 'src/shared/swagger/swagger-config.interface';

// Load environment variables from a .env file
require('dotenv').config();

// Configuration service class
class ConfigService {
  // Constructor takes an object representing environment variables
  constructor(private env: { [k: string]: string | undefined }) {}

  // Private method to retrieve a value from the environment variables
  private getValue(key: string, throwOnMissing = true): string {
    if (!this.env[key] && key === 'POSTGRES_PASSWORD') {
      return '';
    }
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  // Method to ensure that specific keys are present in the environment variables
  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  // Method to get the PORT value from the environment variables
  public getPort() {
    return this.getValue('PORT', true);
  }

  // Method to check if the application is in production mode
  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode !== 'DEV';
  }

  /**
   * ✅ Secure Throttler Config
   * Loads values from `.env` with safe parsing and default fallbacks
   */
  public getThrottlerConfig(): ThrottlerModuleOptions {
    const ttl = parseInt(this.getValue('THROTTLER_TTL', false) || '60', 10);
    const limit = parseInt(
      this.getValue('THROTTLER_LIMIT', false) || '100',
      10,
    );
    if (isNaN(ttl) || ttl <= 0) {
      throw new Error(`Invalid THROTTLER_TTL value in .env`);
    }
    if (isNaN(limit) || limit <= 0) {
      throw new Error(`Invalid THROTTLER_LIMIT value in .env`);
    }

    return {
      throttlers: [
        {
          ttl,
          limit,
        },
      ],
    };
  }

  // Method to get the TypeORM configuration options
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      // Retrieve host, port, username, password, and database from environment variables
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD') || '',
      database: this.getValue('POSTGRES_DATABASE'),

      // Specify the location of entity files
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      // Specify the migrations table name
      migrationsTableName: 'migration',

      // Specify the location of migration files
      migrations: [__dirname + 'src/migration/*.ts'],
      autoLoadEntities: true,
      synchronize: true,
      migrationsRun: true, // Run migrations automatically

      // Enable SSL in production environment
      ssl: false,
      extra: {
        connectionLimit: 10,
        connectTimeout: 10000,
      },
      //logging: true,
    };
  }
  // Method to get the API prefix
  get apiPrefix(): string {
    return this.getValue('PREFIX') + '/';
  }

  // Method to get the Swagger configuration
  get swaggerConfig(): ISwaggerConfigInterface {
    return {
      path: this.getValue('SWAGGER_PATH') || 'docs/v1',
      title: this.getValue('SWAGGER_TITLE') || 'Core API',
      description: this.getValue('SWAGGER_DESCRIPTION'),
      version: this.getValue('SWAGGER_VERSION') || '0.0.1',
      scheme: this.getValue('SWAGGER_SCHEME') === 'https' ? 'https' : 'http',
    };
  }

  public smtpEmailConfig(): MailerModule {
    return {
      transport: {
        host: this.getValue('MAIL_HOST'),
        port: parseInt(this.getValue('MAIL_SMTP_PORT')) || 465,
        secure: true,
        auth: {
          user: this.getValue('MAIL_USER'),
          pass: this.getValue('MAIL_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: this.getValue('DEFAULT_MAIL_FROM'),
      },
      options: {
        logger: true,
        debug: true,
      },
    };
  }
}

// Create an instance of ConfigService using environment variables and ensure required keys are present
const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

const configServiceMail = new ConfigService(process.env).ensureValues([
  'MAIL_HOST',
  'MAIL_USER',
  'MAIL_PASS',
  'MAIL_SMTP_PORT',
  'DEFAULT_MAIL_FROM',
]);

// Export the instance of ConfigService
export { configService, configServiceMail };
