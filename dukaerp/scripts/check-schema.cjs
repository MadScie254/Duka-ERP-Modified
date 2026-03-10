const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Test running queries AS supabase_auth_admin
  // GoTrue's first query on login is typically to look up the user
  try {
    await c.query("SET ROLE supabase_auth_admin");
    console.log('Set role to supabase_auth_admin');
    
    // Try GoTrue's schema introspection query
    const q1 = await c.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users'
    `);
    console.log('Schema introspection OK:', q1.rows.length, 'columns');
    
    // Try to select from auth.users
    const q2 = await c.query(`SELECT id, email FROM auth.users LIMIT 1`);
    console.log('Select from auth.users OK:', JSON.stringify(q2.rows));
    
    // Try to read user by email (what GoTrue does on login)
    const q3 = await c.query(`SELECT * FROM auth.users WHERE email = 'demo@dukaerp.com'`);
    console.log('User lookup OK, rows:', q3.rows.length);
    
    // Try inserting into identities (what GoTrue does)
    // Try the actual encryption function GoTrue uses
    const q4 = await c.query(`SELECT gen_random_uuid()::text as test`);
    console.log('gen_random_uuid OK:', q4.rows[0]?.test);
    
    // Try accessing the functions GoTrue might use
    const q5 = await c.query(`SELECT current_setting('request.jwt.claims', true) as claims`);
    console.log('jwt claims setting:', q5.rows[0]?.claims);
    
    // Check if GoTrue can access pg_crypto for password hashing
    const q6 = await c.query(`SELECT crypt('test', gen_salt('bf')) as hash`);
    console.log('crypt function OK:', q6.rows[0]?.hash?.substring(0, 10));
    
  } catch(e) {
    console.log('ERROR as supabase_auth_admin:', e.message);
  } finally {
    await c.query("RESET ROLE");
  }
  
  // Now drop the trigger and test login again with a controlled test
  console.log('\n--- Dropping trigger and testing login ---');
  await c.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');
  console.log('Trigger dropped');
  
  await c.end();
  
  // Wait a second for GoTrue to pick up the change
  await new Promise(r => setTimeout(r, 2000));
  
  // Test login
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'demo@dukaerp.com', password: 'password123' })
  });
  console.log('Login Status:', resp.status);
  const lb = await resp.text();
  if (resp.status === 200) {
    const data = JSON.parse(lb);
    console.log('LOGIN SUCCESS! User:', data.user?.id);
    console.log('Access token:', data.access_token?.substring(0, 30) + '...');
  } else {
    console.log('Login body:', lb);
  }
  
  // Try signup with a brand new email
  const resp2 = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'test-notrigger@example.com', password: 'Password123!' })
  });
  console.log('\nSignup Status:', resp2.status);
  const sb = await resp2.text();
  console.log('Signup body:', sb.substring(0, 500));
}
main().catch(e => { console.error(e.message); process.exit(1); });
