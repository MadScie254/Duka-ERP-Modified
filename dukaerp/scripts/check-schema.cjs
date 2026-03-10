const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check for stale sessions/refresh tokens for demo user
  const sessions = await c.query(`SELECT id FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099'`);
  console.log('Demo user sessions:', sessions.rows.length);
  
  const tokens = await c.query(`SELECT id FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099')`);
  console.log('Demo user refresh tokens:', tokens.rows.length);
  
  // Clean up all session data for demo user
  await c.query(`DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099')`);
  await c.query(`DELETE FROM auth.mfa_amr_claims WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099')`);
  await c.query(`DELETE FROM auth.sessions WHERE user_id = '00000000-0000-0000-0000-000000000099'`);
  console.log('Cleaned up demo sessions');
  
  // Maybe the problem is very specific: the demo user's ID is all zeros except 99
  // GoTrue might have special handling for nil-like UUIDs
  // Let me check ALL columns of both users to find ANY difference
  const allCols = await c.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users'
    ORDER BY ordinal_position
  `);
  
  const colNames = allCols.rows.map(r => r.column_name).filter(c => c !== 'encrypted_password');
  const query = `SELECT ${colNames.map(c => `"${c}"`).join(', ')} FROM auth.users WHERE email IN ('demo@dukaerp.com', 'dukatest2025@gmail.com') ORDER BY email`;
  const both = await c.query(query);
  
  console.log('\nFULL COMPARISON (excluding password):');
  if (both.rows.length === 2) {
    const [demo, working] = both.rows;
    for (const col of colNames) {
      const dv = JSON.stringify(demo[col]);
      const wv = JSON.stringify(working[col]);
      if (dv !== wv) {
        console.log(`  DIFF ${col}:`);
        console.log(`    demo:    ${dv}`);
        console.log(`    working: ${wv}`);
      }
    }
  }
  
  await c.end();
  
  // Test login again after cleanup
  await new Promise(r => setTimeout(r, 1000));
  console.log('\n--- Login test ---');
  const resp = await fetch('https://ysqzizmgemtkizbvtuyr.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXppem1nZW10a2l6YnZ0dXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAwNzIsImV4cCI6MjA4ODY1NjA3Mn0.on96vHcNkhIzZFTggMNX2A22p5vpzBIippQ6A19Pw1U'
    },
    body: JSON.stringify({ email: 'demo@dukaerp.com', password: 'password123' })
  });
  console.log('Status:', resp.status);
  const lb = await resp.text();
  console.log('Response:', lb.substring(0, 400));
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
