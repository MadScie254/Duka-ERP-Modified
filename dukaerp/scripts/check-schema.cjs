const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  
  // Check all auth schema objects
  const authFuncs = await c.query(`
    SELECT n.nspname, p.proname, pg_get_function_result(p.oid) as return_type
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'auth'
    ORDER BY p.proname
  `);
  console.log('AUTH FUNCTIONS:');
  authFuncs.rows.forEach(r => console.log(`  ${r.proname} -> ${r.return_type}`));
  
  // Check extensions
  const exts = await c.query("SELECT extname FROM pg_extension ORDER BY extname");
  console.log('\nEXTENSIONS:', exts.rows.map(r => r.extname).join(', '));
  
  // Check if any public functions reference non-existent objects
  const publicFuncs = await c.query(`
    SELECT proname, prosrc FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN ('user_owns_shop', 'deduct_stock_on_sale', 'restore_stock_on_void', 'update_customer_totals')
  `);
  console.log('\nPUBLIC TRIGGER FUNCTIONS:');
  publicFuncs.rows.forEach(r => console.log(`--- ${r.proname}: ${r.prosrc.substring(0, 200)}`));
  
  // Check all triggers on public tables for broken references
  const pubTriggers = await c.query(`
    SELECT trigger_name, event_object_table, action_statement 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    ORDER BY event_object_table, trigger_name
  `);
  console.log('\nPUBLIC TRIGGERS:');
  pubTriggers.rows.forEach(r => console.log(`  ${r.event_object_table}.${r.trigger_name}: ${r.action_statement}`));
  
  // Recreate the auth trigger we dropped
  await c.query(`
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user()
  `);
  console.log('\nAuth trigger recreated');
  
  // Check the GoTrue schema version/status
  const schemaMigrations = await c.query(`
    SELECT version FROM auth.schema_migrations ORDER BY version DESC LIMIT 5
  `).catch(e => ({ rows: [], error: e.message }));
  console.log('\nAUTH SCHEMA MIGRATIONS:', JSON.stringify(schemaMigrations.rows || schemaMigrations.error));
  
  // Check db_meta_data or state tables
  const instances = await c.query(`SELECT id FROM auth.instances`).catch(e => ({ rows: [], error: e.message }));
  console.log('AUTH INSTANCES:', JSON.stringify(instances.rows || instances.error));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
