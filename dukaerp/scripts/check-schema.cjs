const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // 1. Confirm the new user's email so we can login
  const newUser = await c.query(`
    SELECT id, email FROM auth.users WHERE email = 'dukatest2025@gmail.com'
  `);
  console.log('New user:', JSON.stringify(newUser.rows[0]));
  
  if (newUser.rows[0]) {
    await c.query(`
      UPDATE auth.users SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
      WHERE email = 'dukatest2025@gmail.com'
    `);
    console.log('Email confirmed for new user');
  }
  
  // 2. Fix the demo user's identity (it was deleted)
  const demoIdent = await c.query(`
    SELECT id FROM auth.identities WHERE user_id = '00000000-0000-0000-0000-000000000099'
  `);
  console.log('Demo user identities:', demoIdent.rows.length);
  
  if (demoIdent.rows.length === 0) {
    await c.query(`
      INSERT INTO auth.identities (
        id, user_id, provider, provider_id, identity_data, 
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000099',
        'email',
        '00000000-0000-0000-0000-000000000099',
        '{"sub": "00000000-0000-0000-0000-000000000099", "email": "demo@dukaerp.com", "email_verified": true}'::jsonb,
        NOW(), NOW(), NOW()
      )
    `);
    console.log('Demo user identity re-created');
  }
  
  await c.end();
  
  // Wait for GoTrue to see the changes
  await new Promise(r => setTimeout(r, 1500));
  
  // 3. Try login with NEW user
  console.log('\n--- Login with new user ---');
  const resp1 = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'dukatest2025@gmail.com', password: 'Password123!' })
  });
  console.log('New user login status:', resp1.status);
  const lb1 = await resp1.text();
  if (resp1.status === 200) {
    const data = JSON.parse(lb1);
    console.log('NEW USER LOGIN SUCCESS! User:', data.user?.id);
    console.log('Token:', data.access_token?.substring(0, 40) + '...');
  } else {
    console.log('New user login response:', lb1.substring(0, 300));
  }
  
  // 4. Try login with demo user  
  console.log('\n--- Login with demo user ---');
  const resp2 = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'demo@dukaerp.com', password: 'password123' })
  });
  console.log('Demo user login status:', resp2.status);
  const lb2 = await resp2.text();
  if (resp2.status === 200) {
    const data = JSON.parse(lb2);
    console.log('DEMO USER LOGIN SUCCESS! User:', data.user?.id);
  } else {
    console.log('Demo user login response:', lb2.substring(0, 300));
  }
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
