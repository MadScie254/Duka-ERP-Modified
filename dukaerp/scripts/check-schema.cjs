const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check for broken functions
  try {
    // Test handle_new_user function definition
    const funcDef = await c.query(`
      SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user'
    `);
    console.log('handle_new_user body:', funcDef.rows[0]?.prosrc);
  } catch(e) { console.log('Error checking function:', e.message); }
  
  // Check if there are multiple handle_new_user functions
  const funcCount = await c.query(`
    SELECT n.nspname as schema, p.proname, pg_get_function_arguments(p.oid) as args
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = 'handle_new_user'
  `);
  console.log('handle_new_user functions:', JSON.stringify(funcCount.rows));
  
  // Try temporarily dropping the trigger and test login
  console.log('\nDropping trigger temporarily...');
  await c.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');
  
  await c.end();
  
  // Now test login
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'demo@dukaerp.com', password: 'password123' })
  });
  
  const body = await resp.text();
  console.log('\nLogin Status (no trigger):', resp.status);
  if (resp.status === 200) {
    const data = JSON.parse(body);
    console.log('LOGIN SUCCESS! User:', data.user?.id);
  } else {
    console.log('Still failing:', body);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
