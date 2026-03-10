const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check all triggers on auth.users
  const authTriggers = await c.query(`
    SELECT trigger_name, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    ORDER BY trigger_name
  `);
  console.log('AUTH.USERS TRIGGERS:');
  authTriggers.rows.forEach(r => console.log(`  ${r.trigger_name}: ${r.action_statement}`));
  
  // Check the RLS policies on auth tables
  const authPolicies = await c.query(`
    SELECT schemaname, tablename, policyname, cmd, qual 
    FROM pg_policies WHERE schemaname = 'auth'
  `).catch(e => ({ rows: [], error: e.message }));
  console.log('\nAUTH POLICIES:', JSON.stringify(authPolicies.rows || authPolicies.error));
  
  // Check auth-related roles
  const roles = await c.query(`
    SELECT rolname, rolcanlogin FROM pg_roles 
    WHERE rolname LIKE '%auth%' OR rolname LIKE '%gotrue%' OR rolname = 'authenticator'
  `);
  console.log('\nAUTH-RELATED ROLES:', JSON.stringify(roles.rows));
  
  // Check ALL auth tables
  const authTables = await c.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'auth' ORDER BY table_name
  `);
  console.log('\nALL AUTH TABLES:', authTables.rows.map(r => r.table_name).join(', '));
  
  // Check auth.users grants
  const grants = await c.query(`
    SELECT grantee, privilege_type FROM information_schema.table_privileges 
    WHERE table_schema = 'auth' AND table_name = 'users' 
    ORDER BY grantee
  `);
  console.log('\nAUTH.USERS GRANTS:');
  grants.rows.forEach(r => console.log(`  ${r.grantee}: ${r.privilege_type}`));
  
  // Check for any search_path issues with the handle_new_user function
  const funcConfig = await c.query(`
    SELECT p.proname, p.proconfig, n.nspname, 
           pg_get_functiondef(p.oid) as funcdef
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'handle_new_user'
  `);
  console.log('\nHANDLE_NEW_USER FULL DEF:');
  funcConfig.rows.forEach(r => {
    console.log('  proconfig:', r.proconfig);
    console.log('  funcdef:', r.funcdef);
  });
  
  // Check if there's a problem with the profiles table foreign key
  const fks = await c.query(`
    SELECT tc.constraint_name, tc.table_schema, tc.table_name, 
           kcu.column_name, ccu.table_schema AS foreign_table_schema,
           ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND (ccu.table_schema = 'auth' OR tc.table_schema = 'auth')
    ORDER BY tc.table_name
  `);
  console.log('\nFK CONSTRAINTS REFERENCING AUTH:');
  fks.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name}.${r.column_name} -> ${r.foreign_table_schema}.${r.foreign_table_name}.${r.foreign_column_name} (${r.constraint_name})`));
  
  await c.end();
  
  // Check GoTrue health
  const health = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/health');
  console.log('\nHealth Status:', health.status);
  const hb = await health.text();
  console.log('Health:', hb);
  
  // Check GoTrue settings endpoint 
  const settings = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/settings', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    }
  });
  console.log('\nSettings Status:', settings.status);
  const sb = await settings.text();
  console.log('Settings:', sb.substring(0, 500));
}
main().catch(e => { console.error(e.message); process.exit(1); });
