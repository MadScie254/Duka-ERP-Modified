const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Delete demo user and identity to start fresh (signup fails, so the issue isn't user-specific)
  await c.query(`DELETE FROM auth.identities WHERE user_id = '00000000-0000-0000-0000-000000000099'`);
  await c.query(`DELETE FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099'`);
  await c.query(`DELETE FROM auth.refresh_tokens WHERE instance_id = '00000000-0000-0000-0000-000000000000'`).catch(() => {});
  await c.query(`DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000099'`);
  console.log('Demo user cleaned up');
  
  // Check if there are ANY other users
  const users = await c.query('SELECT id, email FROM auth.users');
  console.log('Remaining users:', JSON.stringify(users.rows));
  
  // Check auth.flow_state and auth.mfa tables
  const authTables = await c.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'auth' ORDER BY table_name
  `);
  console.log('\nALL AUTH TABLES:', authTables.rows.map(r => r.table_name).join(', '));
  
  // Check all triggers on auth.users
  const authTriggers = await c.query(`
    SELECT trigger_name, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    ORDER BY trigger_name
  `);
  console.log('\nAUTH.USERS TRIGGERS:');
  authTriggers.rows.forEach(r => console.log(`  ${r.trigger_name}: ${r.action_statement}`));
  
  // Check all RLS policies on auth tables
  const authPolicies = await c.query(`
    SELECT schemaname, tablename, policyname, cmd, qual 
    FROM pg_policies WHERE schemaname = 'auth'
  `).catch(e => ({ rows: [], error: e.message }));
  console.log('\nAUTH POLICIES:', JSON.stringify(authPolicies.rows || authPolicies.error));
  
  // Check if there are custom types in auth schema
  const authTypes = await c.query(`
    SELECT typname, typtype FROM pg_type t 
    JOIN pg_namespace n ON t.typnamespace = n.oid 
    WHERE n.nspname = 'auth' AND typtype IN ('e', 'c')
  `);
  console.log('\nAUTH CUSTOM TYPES:', authTypes.rows.map(r => `${r.typname}(${r.typtype})`).join(', '));
  
  // Check GoTrue's actual connection - maybe it uses a different role
  // GoTrue connects as supabase_auth_admin role typically
  const roles = await c.query(`
    SELECT rolname, rolcanlogin FROM pg_roles 
    WHERE rolname LIKE '%auth%' OR rolname LIKE '%gotrue%' OR rolname = 'authenticator'
  `);
  console.log('\nAUTH-RELATED ROLES:', JSON.stringify(roles.rows));
  
  // Check if supabase_auth_admin can access auth schema
  const grants = await c.query(`
    SELECT grantee, privilege_type FROM information_schema.table_privileges 
    WHERE table_schema = 'auth' AND table_name = 'users' 
    ORDER BY grantee
  `);
  console.log('\nAUTH.USERS GRANTS:', JSON.stringify(grants.rows));
  
  await c.end();
  
  // Try signup again (no demo user present)
  console.log('\n--- Testing fresh signup ---');
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'test2@example.com', password: 'TestPassword123!' })
  });
  console.log('Signup Status:', resp.status);
  const body = await resp.text();
  console.log('Signup body:', body.substring(0, 500));
  
  // Check GoTrue health endpoint
  const health = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/health');
  console.log('\nHealth Status:', health.status);
  const hb = await health.text();
  console.log('Health:', hb);
}
main().catch(e => { console.error(e.message); process.exit(1); });
