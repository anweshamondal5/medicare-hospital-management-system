import { ensurePostgresRunning } from './embeddedServer.js';
import { execSync } from 'child_process';

async function main() {
  console.log('--- MediCare Database Bootstrap ---');
  await ensurePostgresRunning();
  console.log('[Database] Pushing Prisma Schema to PostgreSQL...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
    console.log('[Database] Prisma DB push completed successfully.');
    console.log('[Database] Executing database seed...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });
    console.log('[Database] Database ready and seeded!');
  } catch (err: any) {
    console.error('[Database] Migration/Seed error:', err.message);
  }

  console.log('[Database] PostgreSQL Server is running and listening on port 5433.');
  setInterval(() => {}, 1000 * 60 * 60);
}

main().catch(console.error);
