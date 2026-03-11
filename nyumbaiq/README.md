# NyumbaIQ (Danco Analytics)

Kenya-first real estate stack on Supabase + Vite/React/Tailwind with M-Pesa (Safaricom Daraja) and Claude-driven insights.

## Quick start (local)
- `cp .env.example .env.local` and fill the Supabase service role key (for Edge deploy) and database passwords.
- `npm install`
- `npm run dev` (http://localhost:5173)

## Database
- Migration file: `supabase/migrations/0001_nyumbaiq_schema.sql`
- Apply via `supabase db push` or `psql -f supabase/migrations/0001_nyumbaiq_schema.sql`.
- All tables use UUID PKs, timestamps, and RLS enabled. Helper roles: admin/landlord/agent/tenant.
- Realtime is enabled on `rent_payments`, `notifications`, `maintenance_requests`.

## Prisma
- Schema at `prisma/schema.prisma`. Point `DATABASE_URL`/`DIRECT_URL` to the Supabase connection strings (pooler for app, direct for migrations).
- Generate client: `npx prisma generate`.

## Edge Functions (Deno)
Located under `supabase/functions/`:
- `mpesa-stk-push`: initiates STK push, records pending payment.
- `mpesa-callback`: consumes STK callback, updates `rent_payments`, inserts notifications.
- `mpesa-c2b-listener`: Paybill listener using AccountReference to match units.
- `generate-insights`: pulls 90-day data, calls Anthropic Claude, stores `ai_insights`.

Deploy (replace `<project-ref>` with `qszgtwppgcpykzsjtypf`):
```bash
supabase functions deploy mpesa-stk-push --project-ref <project-ref>
supabase functions deploy mpesa-callback --project-ref <project-ref>
supabase functions deploy mpesa-c2b-listener --project-ref <project-ref>
supabase functions deploy generate-insights --project-ref <project-ref>
```

## pg_cron jobs (run in SQL editor once http extension is enabled)
```sql
-- rent_due on 1st monthly
select cron.schedule('rent-due', '0 6 1 * *',
  $$insert into notifications (user_id, type, title, body)
    select tenant_id, 'rent_due', 'Rent due', 'Your rent is due', from leases where status='active';$$);

-- overdue daily 08:00 EAT
select cron.schedule('rent-overdue', '0 5 * * *',
  $$insert into notifications (user_id, type, title, body)
    select l.tenant_id, 'rent_overdue', 'Payment overdue', 'Please clear balance'
    from leases l
    where l.status='active' and l.payment_day + 5 < extract(day from now());$$);

-- lease expiring 60 days
select cron.schedule('lease-expiring', '15 5 * * *',
  $$insert into notifications (user_id, type, title, body)
    select tenant_id, 'lease_expiring', 'Lease expiring soon', 'Lease ends soon'
    from leases where status='active' and end_date <= now() + interval '60 days';$$);

-- regenerate insights daily
select cron.schedule('generate-insights', '30 5 * * *',
  $$select net.http_post(
      url:='https://qszgtwppgcpykzsjtypf.supabase.co/functions/v1/generate-insights',
      headers:='{\"Content-Type\":\"application/json\",\"apikey\":\"' || current_setting('app.settings.service_role_key') || '\"}'
  );$$);
```

## PWA
- Configured in `vite.config.ts` via `vite-plugin-pwa` with theme color `#0A1628`, start URL `/dashboard`, standalone display.
- Icons under `public/icons/nyumbaiq.svg`.
- Offline UX: add a branded fallback page in `public/offline.html` and map it in the service worker if desired.

## Buckets (to create in Supabase Storage)
- `property-images` (public read)
- `profile-avatars` (public read)
- `lease-documents`, `payment-receipts`, `maintenance-images`, `bank-statements`, `id-documents` (private; scope with RLS/storage policies)

## Frontend structure
- React Router with role-aware landing at `/dashboard`.
- Tailwind tokens: navy #0A1628, blue #1B4FD8, green #00A86B, amber #F59E0B, red #EF4444, bg #F7F8FC, border #E5E7EB.
- Shared helpers: `src/lib/formatters.ts` (KES, dates, phone), `src/lib/counties.ts` (47 counties), `src/lib/mpesa.ts` (invoke STK).
- Layout shell at `src/components/layout/Shell.tsx`.

## Next steps
1) Replace placeholder stats with live Supabase queries per role.
2) Implement real forms for rent payment (calls `initiateStkPush`) and maintenance submission (file uploads to storage).
3) Add Supabase Storage policy SQL for each bucket (private scopes).
4) Add Realtime listeners in front-end for `rent_payments` and `notifications`.
5) Run Lighthouse PWA audit after adding final icons and offline fallback.
