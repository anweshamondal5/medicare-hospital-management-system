import path from 'path';
import fs from 'fs';
import pg from 'pg';

let pgInstance: any = null;

export async function canConnectToPostgres(connectionString: string): Promise<boolean> {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 1500 });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (e) {
    try { await client.end(); } catch (_) {}
    return false;
  }
}

export async function ensurePostgresRunning(): Promise<string> {
  const defaultUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/postgres';

  // 1. Check if configured database is already reachable
  if (await canConnectToPostgres(defaultUrl)) {
    console.log('[Database] Connected to PostgreSQL at:', defaultUrl.split('@')[1] || defaultUrl);
    return defaultUrl;
  }

  // 2. Check if default port 5432 is running
  const port5432Url = 'postgresql://postgres:postgres@localhost:5432/medicare_db';
  if (await canConnectToPostgres(port5432Url)) {
    console.log('[Database] Connected to local PostgreSQL on port 5432.');
    process.env.DATABASE_URL = port5432Url;
    return port5432Url;
  }

  // 3. Start embedded PostgreSQL on port 5433
  const port = 5433;
  const embeddedUrl = `postgresql://postgres:password@localhost:${port}/postgres`;
  console.log(`[Database] Starting Embedded PostgreSQL on port ${port}...`);

  try {
    const EmbeddedPostgresModule = await import('embedded-postgres');
    const EmbeddedPostgres = (EmbeddedPostgresModule as any).default?.default || (EmbeddedPostgresModule as any).default || EmbeddedPostgresModule;

    const dataDir = path.resolve(process.cwd(), '.pgdata');
    pgInstance = new EmbeddedPostgres({
      port,
      databaseDir: dataDir,
      user: 'postgres',
      password: 'password'
    });

    const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
    if (!isInitialized) {
      console.log('[Database] Initializing cluster at:', dataDir);
      await pgInstance.initialise();
    }

    await pgInstance.start();
    console.log(`[Database] Embedded PostgreSQL running successfully on port ${port}!`);

    process.env.DATABASE_URL = embeddedUrl;

    const cleanup = async () => {
      if (pgInstance) {
        console.log('\n[Database] Stopping Embedded PostgreSQL...');
        try {
          await pgInstance.stop();
        } catch (e) {
          // ignore
        }
      }
    };

    process.on('SIGINT', async () => {
      await cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await cleanup();
      process.exit(0);
    });

    return embeddedUrl;
  } catch (err) {
    console.warn('[Database] Could not start embedded postgres:', err);
    return embeddedUrl;
  }
}
