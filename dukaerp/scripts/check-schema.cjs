const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();

  // Check auth.users for demo user
  const user = await c.query(
    "SELECT id, email, encrypted_password, email_confirmed_at, role, aud, instance_id, is_sso_user, confirmation_token FROM auth.users WHERE email='demo@dukaerp.com'"
  );
  console.log('AUTH USER:', JSON.stringify(user.rows, null, 2));

  // Check auth.identities
  const ident = await c.query(
    "SELECT id, provider, provider_id, user_id FROM auth.identities WHERE user_id='00000000-0000-0000-0000-000000000099'"
  );
  console.log('IDENTITIES:', JSON.stringify(ident.rows, null, 2));

  // Check profiles
  const prof = await c.query("SELECT * FROM profiles WHERE id='00000000-0000-0000-0000-000000000099'");
  console.log('PROFILE:', JSON.stringify(prof.rows, null, 2));

  // Check shops
  const shop = await c.query("SELECT id, owner_id, name FROM shops WHERE owner_id='00000000-0000-0000-0000-000000000099'");
  console.log('SHOPS:', JSON.stringify(shop.rows, null, 2));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
