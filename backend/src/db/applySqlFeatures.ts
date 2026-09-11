import fs from 'fs';
import path from 'path';
import pg from 'pg';

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/postgres';
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  console.log('[PostgreSQL] Connected to apply advanced DBMS features...');

  const rootDir = path.resolve(process.cwd(), '..');
  const files = [
    path.join(rootDir, 'database', 'views.sql'),
    path.join(rootDir, 'database', 'procedures.sql'),
    path.join(rootDir, 'database', 'triggers.sql'),
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`[PostgreSQL] Applying ${path.basename(file)}...`);
      const sql = fs.readFileSync(file, 'utf-8');
      try {
        await client.query(sql);
        console.log(`[PostgreSQL] Successfully applied ${path.basename(file)}`);
      } catch (err: any) {
        console.warn(`[PostgreSQL] Warning executing ${path.basename(file)}:`, err.message);
      }
    }
  }

  await client.end();
  console.log('[PostgreSQL] Advanced DBMS features (Views, Procedures, Triggers) successfully configured in database!');
}

main().catch(console.error);
