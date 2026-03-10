const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();

  // Check auth.users columns
  const cols = await c.query(
    "SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' ORDER BY ordinal_position"
  );
  console.log('AUTH.USERS COLUMNS:');
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}, nullable:${r.is_nullable}, default:${r.column_default ? 'yes' : 'no'})`));

  // Check demo user row completely
  const user = await c.query("SELECT * FROM auth.users WHERE id='00000000-0000-0000-0000-000000000099'");
  if (user.rows.length) {
    const u = user.rows[0];
    console.log('\nDEMO USER:');
    Object.keys(u).forEach(k => {
      const v = u[k];
      if (v !== null && v !== undefined && v !== '') console.log(`  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
      else if (v === null) console.log(`  ${k}: NULL`);
    });
  }

  // Check auth triggers
  const triggers = await c.query(
    "SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE trigger_schema='auth'"
  );
  console.log('\nAUTH TRIGGERS:', JSON.stringify(triggers.rows, null, 2));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
