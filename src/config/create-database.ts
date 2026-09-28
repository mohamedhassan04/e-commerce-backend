import { ConfigService } from '@nestjs/config';
import { ClientConfig } from 'pg';
import { connectToPostgres } from './postgres-ssl';

async function createDatabaseIfNotExists() {
  const configService = new ConfigService();

  const databaseName = configService.get<string>('POSTGRES_DATABASE');
  const connectionOptions: ClientConfig = {
    host: configService.get<string>('POSTGRES_HOST'),
    port: parseInt(configService.get<string>('POSTGRES_PORT')),
    user: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
  };

  // Connecting to the configured database tells us whether it already exists.
  try {
    const client = await connectToPostgres({
      ...connectionOptions,
      database: databaseName,
    });
    await client.end();
    return;
  } catch (error) {
    // 3D000 = database does not exist, anything else is a real failure
    if ((error as { code?: string }).code !== '3D000') {
      throw error;
    }
  }

  const client = await connectToPostgres(connectionOptions);
  try {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await client.end();
  }
}

export default createDatabaseIfNotExists;
