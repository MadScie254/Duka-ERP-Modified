const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check table ownership of auth.users
  const owner = await c.query(`
    SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
  `);
  console.log('AUTH.USERS OWNER:', owner.rows[0]?.tableowner);
  
  // Check auth schema ownership
  const schemaOwner = await c.query(`
    SELECT nspname, pg_catalog.pg_get_userbyid(nspowner) as owner 
    FROM pg_namespace WHERE nspname = 'auth'
  `);
  console.log('AUTH SCHEMA OWNER:', schemaOwner.rows[0]?.owner);
  
  // Check what the supabase_auth_admin role can do
  const authAdminPrivs = await c.query(`
    SELECT r.rolname, r.rolsuper, r.rolinherit, r.rolcreaterole, r.rolcreatedb,
           r.rolcanlogin, r.rolconnlimit,
           ARRAY(SELECT b.rolname 
                 FROM pg_catalog.pg_auth_members m 
                 JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid) 
                 WHERE m.member = r.oid) as member_of
    FROM pg_catalog.pg_roles r 
    WHERE r.rolname = 'supabase_auth_admin'
  `);
  console.log('\nSUPABASE_AUTH_ADMIN:', JSON.stringify(authAdminPrivs.rows));
  
  // Check what supabase_auth_admin owns in auth schema
  const authAdminOwned = await c.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'auth' AND tableowner = 'supabase_auth_admin'
  `);
  console.log('\nTABLES OWNED BY supabase_auth_admin:', authAdminOwned.rows.map(r => r.tablename).join(', '));
  
  // Check all table owners in auth schema
  const allOwners = await c.query(`
    SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename
  `);
  console.log('\nAUTH TABLE OWNERS:');
  allOwners.rows.forEach(r => console.log(`  ${r.tablename}: ${r.tableowner}`));
  
  // Check if handle_new_user can be called by the auth admin role
  const funcOwner = await c.query(`
    SELECT p.proname, pg_catalog.pg_get_userbyid(p.proowner) as owner, p.prosecdef
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'handle_new_user'
  `);
  console.log('\nHANDLE_NEW_USER OWNER:', JSON.stringify(funcOwner.rows));
  
  // Check schema privileges for supabase_auth_admin
  const schemaPrivs = await c.query(`
    SELECT has_schema_privilege('supabase_auth_admin', 'auth', 'USAGE') as auth_usage,
           has_schema_privilege('supabase_auth_admin', 'public', 'USAGE') as public_usage,
           has_table_privilege('supabase_auth_admin', 'auth.users', 'SELECT') as users_select,
           has_table_privilege('supabase_auth_admin', 'auth.users', 'INSERT') as users_insert,
           has_table_privilege('supabase_auth_admin', 'auth.users', 'UPDATE') as users_update,
           has_table_privilege('supabase_auth_admin', 'auth.users', 'DELETE') as users_delete
  `);
  console.log('\nSUPABASE_AUTH_ADMIN PRIVILEGES:', JSON.stringify(schemaPrivs.rows[0]));
  
  // Check if there's an issue with function search paths
  const searchPath = await c.query("SHOW search_path");
  console.log('\nSEARCH PATH:', searchPath.rows[0]?.search_path);
  
  // Try running handle_new_user as supabase_auth_admin would
  // Check if the profiles table is accessible by supabase_auth_admin
  const profilesPriv = await c.query(`
    SELECT has_table_privilege('supabase_auth_admin', 'public.profiles', 'INSERT') as can_insert,
           has_table_privilege('supabase_auth_admin', 'public.profiles', 'SELECT') as can_select
  `);
  console.log('PROFILES PRIV FOR AUTH_ADMIN:', JSON.stringify(profilesPriv.rows[0]));
  
  await c.end();
  
  // Health check with apikey
  const health = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/health', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    }
  });
  console.log('\nHealth Status:', health.status);
  const hb = await health.text();
  console.log('Health:', hb);
}
main().catch(e => { console.error(e.message); process.exit(1); });
