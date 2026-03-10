const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Compare the working user and the broken demo user
  const users = await c.query(`
    SELECT id, email, aud, role, instance_id, 
           raw_app_meta_data, raw_user_meta_data,
           email_confirmed_at, confirmed_at,
           is_sso_user, is_anonymous,
           SUBSTRING(encrypted_password, 1, 4) as pw_algo
    FROM auth.users 
    WHERE email IN ('demo@dukaerp.com', 'dukatest2025@gmail.com')
    ORDER BY email
  `);
  
  users.rows.forEach(u => {
    console.log(`\n=== ${u.email} ===`);
    console.log('  id:', u.id);
    console.log('  aud:', u.aud);
    console.log('  role:', u.role);
    console.log('  instance_id:', u.instance_id);
    console.log('  raw_app_meta_data:', JSON.stringify(u.raw_app_meta_data));
    console.log('  raw_user_meta_data:', JSON.stringify(u.raw_user_meta_data));
    console.log('  email_confirmed_at:', u.email_confirmed_at);
    console.log('  confirmed_at:', u.confirmed_at);
    console.log('  is_sso_user:', u.is_sso_user);
    console.log('  is_anonymous:', u.is_anonymous);
    console.log('  pw_algo:', u.pw_algo);
  });
  
  // Compare identities
  const idents = await c.query(`
    SELECT user_id, provider, provider_id, identity_data
    FROM auth.identities 
    WHERE user_id IN ('00000000-0000-0000-0000-000000000099', '3a636a38-38a3-4485-af73-8e779906b0b7')
    ORDER BY user_id
  `);
  console.log('\n--- IDENTITIES ---');
  idents.rows.forEach(i => {
    console.log(`  user_id: ${i.user_id}`);
    console.log(`  provider: ${i.provider}, provider_id: ${i.provider_id}`);
    console.log(`  identity_data: ${JSON.stringify(i.identity_data)}`);
    console.log('');
  });
  
  await c.end();
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
