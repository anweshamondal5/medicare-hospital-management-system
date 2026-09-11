import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

async function init() {
  console.log('--- Initializing MediCare PostgreSQL Engine ---');
  const EmbeddedPostgresModule = await import('embedded-postgres');
  const EmbeddedPostgres = (EmbeddedPostgresModule as any).default?.default || (EmbeddedPostgresModule as any).default || EmbeddedPostgresModule;

  const dataDir = path.resolve(process.cwd(), '.pgdata');
  const pgServer = new EmbeddedPostgres({
    port: 5433,
    databaseDir: dataDir,
    user: 'postgres',
    password: 'password'
  });

  if (!fs.existsSync(path.join(dataDir, 'PG_VERSION'))) {
    console.log('[PostgreSQL] Initializing cluster at:', dataDir);
    await pgServer.initialise();
  }

  console.log('[PostgreSQL] Starting server on port 5433...');
  await pgServer.start();
  console.log('[PostgreSQL] PostgreSQL is online on port 5433!');

  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5433/postgres';

  console.log('[Prisma] Pushing schema to PostgreSQL database...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });

  console.log('[Prisma] Seeding database with hospital data...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });

  console.log('--- Database Initialization Complete ---');
  setInterval(() => {}, 1000 * 60 * 60);
}

init().catch(console.error);
