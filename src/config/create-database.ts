import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

async function createDatabaseIfNotExists() {
  const configService = new ConfigService();

  const client = new Client({
    host: configService.get<string>('POSTGRES_HOST'),
    port: parseInt(configService.get<string>('POSTGRES_PORT')),
    user: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
  });
  const databaseName = configService.get<string>('POSTGRES_DATABASE');

  try {
    await client.connect();
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    } else {
      return;
    }
  } finally {
    await client.end();
  }
}

export default createDatabaseIfNotExists;
