const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  const NEW_USER_ID = '3a636a38-38a3-4485-af73-8e779906b0b7';
  const OLD_USER_ID = '00000000-0000-0000-0000-000000000099';
  const SHOP_ID = '00000000-0000-0000-0000-000000000001';
  
  // 1. Create profile for the new user
  try {
    await c.query(`
      INSERT INTO profiles (id, full_name, phone, plan)
      VALUES ($1, 'Demo User', '+254700000000', 'free')
      ON CONFLICT (id) DO UPDATE SET full_name = 'Demo User'
    `, [NEW_USER_ID]);
    console.log('1. Profile created for new user');
  } catch(e) {
    console.log('1. Profile error:', e.message);
  }
  
  // 2. Update shop owner to new user
  try {
    await c.query(`UPDATE shops SET owner_id = $1 WHERE id = $2`, [NEW_USER_ID, SHOP_ID]);
    console.log('2. Shop owner updated to new user');
  } catch(e) {
    console.log('2. Shop owner update error:', e.message);
  }
  
  // 3. Update sales cashier_id to new user
  try {
    const updated = await c.query(`UPDATE sales SET cashier_id = $1 WHERE cashier_id = $2`, [NEW_USER_ID, OLD_USER_ID]);
    console.log('3. Updated', updated.rowCount, 'sales cashier_id');
  } catch(e) {
    console.log('3. Sales cashier update error:', e.message);
  }
  
  // 4. Check for any other references to the old user
  const fks = await c.query(`
    SELECT tc.table_name, kcu.column_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'profiles' AND ccu.column_name = 'id'
  `);
  console.log('4. Tables referencing profiles.id:', fks.rows.map(r => `${r.table_name}.${r.column_name}`).join(', '));
  
  // 5. Now clean up old user (remove identity, then try deleting if possible)
  try {
    await c.query(`DELETE FROM auth.identities WHERE user_id = $1`, [OLD_USER_ID]);
    console.log('5. Old user identities deleted');
    
    // Try deleting old profile (might fail if still referenced)
    await c.query(`DELETE FROM profiles WHERE id = $1`, [OLD_USER_ID]);
    console.log('5. Old profile deleted');
    
    // Try deleting old user from auth
    await c.query(`DELETE FROM auth.users WHERE id = $1`, [OLD_USER_ID]);
    console.log('5. Old auth user deleted');
  } catch(e) {
    console.log('5. Cleanup error:', e.message);
    // That's OK - we'll just leave the old user around
  }
  
  // 6. Recreate the auth trigger (for future signups)
  await c.query(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`);
  await c.query(`
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user()
  `);
  console.log('6. Auth trigger recreated');
  
  // 7. Verify everything
  const profile = await c.query(`SELECT id, full_name FROM profiles WHERE id = $1`, [NEW_USER_ID]);
  console.log('7. New user profile:', JSON.stringify(profile.rows[0]));
  
  const shop = await c.query(`SELECT id, name, owner_id FROM shops WHERE id = $1`, [SHOP_ID]);
  console.log('7. Shop:', JSON.stringify(shop.rows[0]));
  
  const products = await c.query(`SELECT COUNT(*) FROM products WHERE shop_id = $1`, [SHOP_ID]);
  console.log('7. Products:', products.rows[0]?.count);
  
  await c.end();
  
  // 8. Verify login still works
  console.log('\n--- Login verification ---');
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'dukatest2025@gmail.com', password: 'Password123!' })
  });
  console.log('Login Status:', resp.status);
  if (resp.status === 200) {
    const data = JSON.parse(await resp.text());
    console.log('LOGIN SUCCESS! User:', data.user?.id);
    console.log('Access token:', data.access_token?.substring(0, 40) + '...');
  } else {
    console.log('Login error:', await resp.text());
  }
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
