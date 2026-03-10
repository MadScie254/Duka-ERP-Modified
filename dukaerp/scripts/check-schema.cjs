const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Fix demo user to match GoTrue's expected format
  // 1. Update raw_user_meta_data to include sub, email, email_verified
  // 2. Re-hash password with GoTrue's default cost factor (10)
  await c.query(`
    UPDATE auth.users SET
      raw_user_meta_data = jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000099',
        'email', 'demo@dukaerp.com',
        'full_name', 'Demo User',
        'email_verified', true,
        'phone_verified', false
      ),
      encrypted_password = crypt('password123', gen_salt('bf', 10)),
      updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000099'
  `);
  console.log('Demo user updated with proper metadata and password hash');
  
  // Verify
  const user = await c.query(`
    SELECT SUBSTRING(encrypted_password, 1, 7) as pw_prefix,
           raw_user_meta_data
    FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000099'
  `);
  console.log('Updated pw_prefix:', user.rows[0]?.pw_prefix);
  console.log('Updated meta:', JSON.stringify(user.rows[0]?.raw_user_meta_data));
  
  // Also update the identity data
  await c.query(`
    UPDATE auth.identities SET
      identity_data = jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000099',
        'email', 'demo@dukaerp.com',
        'full_name', 'Demo User',
        'email_verified', true,
        'phone_verified', false
      ),
      updated_at = NOW()
    WHERE user_id = '00000000-0000-0000-0000-000000000099'
  `);
  console.log('Identity data updated');
  
  await c.end();
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test login
  console.log('\n--- Login with updated demo user ---');
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
    console.log('DEMO LOGIN SUCCESS! User:', data.user?.id);
  } else {
    console.log('Login response:', lb.substring(0, 400));
  }
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
