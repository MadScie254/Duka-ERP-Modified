const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check instances table schema
  const cols = await c.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema='auth' AND table_name='instances'
    ORDER BY ordinal_position
  `);
  console.log('INSTANCES TABLE COLUMNS:');
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}, nullable=${r.is_nullable})`));
  
  // Insert default instance
  try {
    await c.query(`
      INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000000',
              '00000000-0000-0000-0000-000000000000',
              '{"JWT_SECRET":"super-secret-jwt-token-with-at-least-32-characters-long","JWT_EXP":3600}',
              NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('Instance inserted');
  } catch(e) {
    console.log('Instance insert error:', e.message);
  }
  
  // Verify
  const inst = await c.query('SELECT * FROM auth.instances');
  console.log('Instances now:', JSON.stringify(inst.rows));
  
  await c.end();
  
  // Test login again
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'demo@dukaerp.com', password: 'password123' })
  });
  
  const body = await resp.text();
  console.log('\nLogin Status:', resp.status);
  if (resp.status === 200) {
    const data = JSON.parse(body);
    console.log('LOGIN SUCCESS! User:', data.user?.id);
  } else {
    console.log('Login body:', body.substring(0, 500));
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
