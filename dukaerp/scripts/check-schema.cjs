const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await c.connect();
  const funcs = await c.query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) as args, pg_get_function_result(p.oid) as ret
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prokind = 'f'
    AND p.proname NOT IN ('update_updated_at_column', 'deduct_stock_on_sale', 'restore_stock_on_void', 'update_customer_totals', 'handle_new_user', 'user_owns_shop')
    ORDER BY p.proname
  `);
  console.log('RPC FUNCTIONS:');
  funcs.rows.forEach(r => console.log('  ' + r.proname + '(' + r.args + ') -> ' + r.ret));
  await c.end();
}
main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
