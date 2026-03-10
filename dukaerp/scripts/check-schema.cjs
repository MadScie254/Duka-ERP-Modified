const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();

  // Fix: Insert the missing identity record for the demo user
  const userId = '00000000-0000-0000-0000-000000000099';
  
  // Delete any bad identity rows first
  await c.query("DELETE FROM auth.identities WHERE user_id = $1", [userId]);

  // Insert proper identity
  await c.query(`
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      $1,
      $2::uuid,
      jsonb_build_object('sub', $1, 'email', 'demo@dukaerp.com', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    )
  `, [userId, userId]);
  console.log('Identity record inserted for demo user');

  // Verify
  const ident = await c.query("SELECT id, provider, provider_id FROM auth.identities WHERE user_id = $1", [userId]);
  console.log('IDENTITIES:', JSON.stringify(ident.rows));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
