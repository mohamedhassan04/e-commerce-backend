import { Client, ClientConfig } from 'pg';

// Whether the Postgres server accepts TLS connections. Cloud instances (Render,
// Neon, ...) require it, plain local servers usually have none at all. The value
// is learned by the first connection attempt (see connectToPostgres) and is read
// afterwards by the TypeORM configuration.
let tlsSupported = true;

export async function connectToPostgres(
  options: ClientConfig,
): Promise<Client> {
  const secureClient = new Client({
    ...options,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await secureClient.connect();
    tlsSupported = true;
    return secureClient;
  } catch (error) {
    await secureClient.end().catch(() => undefined);

    if (
      !(error instanceof Error) ||
      !error.message.includes('does not support SSL')
    ) {
      // The TLS handshake either succeeded (the server rejected the
      // startup packet) or never happened - keep the secure default.
      tlsSupported = true;
      throw error;
    }

    tlsSupported = false;
    const client = new Client(options);
    await client.connect();
    return client;
  }
}

export function postgresSslOptions() {
  return tlsSupported ? { rejectUnauthorized: false } : false;
}
