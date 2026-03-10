const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();

  // The handle_new_user trigger function is SECURITY DEFINER owned by postgres,
  // so it runs as postgres. But GoTrue's supabase_auth_admin role fires the trigger.
  // Let's make sure the function has the right search_path set
  await c.query(`
    ALTER FUNCTION handle_new_user() SET search_path = public
  `);
  console.log('Set handle_new_user search_path to public');
  
  // Grant supabase_auth_admin INSERT on profiles (needed for the trigger to work
  // even though handle_new_user is SECURITY DEFINER, in some Supabase configurations
  // the caller's permissions are checked for the trigger first)
  await c.query(`GRANT INSERT ON public.profiles TO supabase_auth_admin`);
  console.log('Granted INSERT on profiles to supabase_auth_admin');
  
  // Verify RLS is enabled on our tables and policies exist
  const rlsStatus = await c.query(`
    SELECT tablename, rowsecurity FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('products', 'sales', 'customers', 'shops', 'profiles', 'expenses')
    ORDER BY tablename
  `);
  console.log('\nRLS STATUS:');
  rlsStatus.rows.forEach(r => console.log(`  ${r.tablename}: RLS=${r.rowsecurity}`));
  
  // Check existing policies
  const policies = await c.query(`
    SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname
  `);
  console.log('\nRLS POLICIES:');
  policies.rows.forEach(r => console.log(`  ${r.tablename}: ${r.policyname} (${r.cmd})`));
  
  // Test signup with demo email (now that old user is deleted)
  await c.end();
  
  console.log('\n--- Testing signup with demo@dukaerp.com ---');
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ 
      email: 'demo@dukaerp.com', 
      password: 'password123',
      data: { full_name: 'Demo User', phone: '+254700000000' }
    })
  });
  console.log('Signup Status:', resp.status);
  const body = await resp.text();
  if (resp.status === 200) {
    const data = JSON.parse(body);
    console.log('SIGNUP SUCCESS! User:', data.id);
  } else {
    console.log('Signup:', body.substring(0, 400));
  }
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
