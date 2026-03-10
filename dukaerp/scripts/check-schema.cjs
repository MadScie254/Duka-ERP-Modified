const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check auth.users columns
  const cols = await c.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema='auth' AND table_name='users'
    ORDER BY ordinal_position
  `);
  console.log('AUTH.USERS COLUMNS:');
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

  // Check the demo user's key fields
  const user = await c.query(`
    SELECT id, email, encrypted_password, 
           SUBSTRING(encrypted_password, 1, 10) as pw_prefix,
           aud, role, instance_id, 
           is_sso_user, is_anonymous,
           created_at, confirmation_sent_at, confirmed_at, email_confirmed_at
    FROM auth.users WHERE email = 'demo@dukaerp.com'
  `);
  console.log('\nDEMO USER:');
  if (user.rows[0]) {
    const u = user.rows[0];
    console.log('  id:', u.id);
    console.log('  email:', u.email);
    console.log('  pw_prefix:', u.pw_prefix);
    console.log('  aud:', u.aud);
    console.log('  role:', u.role);
    console.log('  instance_id:', u.instance_id);
    console.log('  is_sso_user:', u.is_sso_user);
    console.log('  is_anonymous:', u.is_anonymous);
    console.log('  confirmed_at:', u.confirmed_at);
    console.log('  email_confirmed_at:', u.email_confirmed_at);
  }

  // Check auth.identities
  const ident = await c.query(`
    SELECT id, user_id, provider, provider_id, created_at 
    FROM auth.identities WHERE user_id = '00000000-0000-0000-0000-000000000099'
  `);
  console.log('\nIDENTITIES:', JSON.stringify(ident.rows));
  
  // Try to do what GoTrue does - check the schema
  // GoTrue runs: SELECT column_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users'
  const gotrueCheck = await c.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users' 
    ORDER BY ordinal_position
  `);
  console.log('\nGoTrue schema check OK, columns:', gotrueCheck.rows.length);
  
  // Check if there's a hook or event trigger that could interfere
  const eventTriggers = await c.query(`
    SELECT evtname, evtevent, evtowner::regrole 
    FROM pg_event_trigger
  `).catch(e => ({ rows: [], error: e.message }));
  console.log('\nEVENT TRIGGERS:', JSON.stringify(eventTriggers.rows || eventTriggers.error));
  
  // Check for any broken views
  const views = await c.query(`
    SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'auth'
  `);
  console.log('\nAUTH VIEWS:', JSON.stringify(views.rows));

  // Clean up - remove the instance we added (GoTrue manages its own)
  await c.query(`DELETE FROM auth.instances WHERE id = '00000000-0000-0000-0000-000000000000'`);
  
  // Now try signing up a completely fresh user via the REST API
  const resp2 = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'test-fresh@example.com', password: 'TestPassword123!' })
  });
  console.log('\nSignup Status:', resp2.status);
  const body2 = await resp2.text();
  console.log('Signup body:', body2.substring(0, 500));
  
  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
