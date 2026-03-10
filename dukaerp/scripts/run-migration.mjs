import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    // Run migration
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_full_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');

    // Verify tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Tables created:');
    res.rows.forEach(r => console.log('  -', r.table_name));

  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('already exists')) {
      console.log('Some objects already exist - this is OK for IF NOT EXISTS statements.');
      console.log('Checking what tables exist...');
      try {
        const res = await client.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);
        console.log('Existing tables:');
        res.rows.forEach(r => console.log('  -', r.table_name));
      } catch (e) {
        console.error('Could not list tables:', e.message);
      }
    }
  } finally {
    await client.end();
  }
}

run();
