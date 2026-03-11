-- NyumbaIQ – Part 2: Row Level Security policies
-- All tables now exist, so cross-table references in policies are safe.

-- ── Profiles ──────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "users_can_view_self" on public.profiles
for select using (auth.uid() = id);

create policy "users_can_update_self" on public.profiles
for update using (auth.uid() = id);

create policy "admin_manage_profiles" on public.profiles
for all using (public.is_role('admin') = true);

create policy "landlord_view_their_tenants" on public.profiles
for select using (
  public.is_role('landlord') = true and
  exists (
    select 1 from public.leases l
    where l.landlord_id = auth.uid()
      and l.tenant_id = public.profiles.id
  )
);

create policy "agent_view_clients" on public.profiles
for select using (
  public.is_role('agent') = true and
  exists (
    select 1 from public.listings lst
    join public.properties p on p.id = lst.property_id
    where lst.listed_by = auth.uid()
      and p.owner_id = public.profiles.id
  )
);

-- ── Properties ────────────────────────────────────────────────────────

alter table public.properties enable row level security;

create policy "admin_full_properties" on public.properties
for all using (public.is_role('admin') = true);

create policy "landlord_owns_properties" on public.properties
for all using (public.is_role('landlord') = true and owner_id = auth.uid());

create policy "agents_view_public_properties" on public.properties
for select using (public.is_role('agent') = true and is_listed_publicly = true);

create policy "tenant_view_assigned_property" on public.properties
for select using (
  public.is_role('tenant') = true
  and exists (
    select 1 from public.leases l
    where l.tenant_id = auth.uid()
      and l.property_id = public.properties.id
      and l.status = 'active'
  )
);

-- ── Units ─────────────────────────────────────────────────────────────

alter table public.units enable row level security;

create policy "admin_full_units" on public.units
for all using (public.is_role('admin') = true);

create policy "landlord_units" on public.units
for all using (
  public.is_role('landlord') = true and
  exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);

create policy "agent_view_public_units" on public.units
for select using (
  public.is_role('agent') = true and
  exists (select 1 from public.properties p where p.id = property_id and p.is_listed_publicly = true)
);

create policy "tenant_view_unit" on public.units
for select using (
  public.is_role('tenant') = true and
  exists (
    select 1 from public.leases l
    where l.unit_id = public.units.id
      and l.tenant_id = auth.uid()
      and l.status = 'active'
  )
);

-- ── Leases ────────────────────────────────────────────────────────────

alter table public.leases enable row level security;

create policy "admin_full_leases" on public.leases
for all using (public.is_role('admin') = true);

create policy "landlord_leases" on public.leases
for all using (public.is_role('landlord') = true and landlord_id = auth.uid());

create policy "tenant_view_own_lease" on public.leases
for select using (public.is_role('tenant') = true and tenant_id = auth.uid());

create policy "agent_view_public_leases" on public.leases
for select using (
  public.is_role('agent') = true and
  exists (select 1 from public.properties p where p.id = public.leases.property_id and p.is_listed_publicly = true)
);

-- ── Rent payments ─────────────────────────────────────────────────────

alter table public.rent_payments enable row level security;

create policy "admin_full_rent" on public.rent_payments
for all using (public.is_role('admin') = true);

create policy "landlord_rent" on public.rent_payments
for select using (
  public.is_role('landlord') = true and
  exists (select 1 from public.properties p where p.id = public.rent_payments.property_id and p.owner_id = auth.uid())
);

create policy "tenant_view_payments" on public.rent_payments
for select using (public.is_role('tenant') = true and tenant_id = auth.uid());

create policy "insert_payment_via_edge" on public.rent_payments
for insert
with check (
  public.is_role('admin') = true
  or public.is_role('landlord') = true
  or auth.role() = 'service_role'
);

-- ── Bank transactions ─────────────────────────────────────────────────

alter table public.bank_transactions enable row level security;

create policy "admin_full_bank" on public.bank_transactions
for all using (public.is_role('admin') = true);

create policy "landlord_bank_records" on public.bank_transactions
for all using (public.is_role('landlord') = true and landlord_id = auth.uid());

-- ── Maintenance requests ──────────────────────────────────────────────

alter table public.maintenance_requests enable row level security;

create policy "admin_full_maintenance" on public.maintenance_requests
for all using (public.is_role('admin') = true);

create policy "landlord_maintenance" on public.maintenance_requests
for all using (
  public.is_role('landlord') = true and
  exists (select 1 from public.properties p where p.id = public.maintenance_requests.property_id and p.owner_id = auth.uid())
);

create policy "tenant_create_and_view" on public.maintenance_requests
for select using (public.is_role('tenant') = true and reported_by = auth.uid());

create policy "tenant_insert_request" on public.maintenance_requests
for insert with check (public.is_role('tenant') = true and reported_by = auth.uid());

-- ── Listings ──────────────────────────────────────────────────────────

alter table public.listings enable row level security;

create policy "admin_full_listings" on public.listings
for all using (public.is_role('admin') = true);

create policy "landlord_manage_own_listings" on public.listings
for all using (
  public.is_role('landlord') = true and
  exists (select 1 from public.properties p where p.id = public.listings.property_id and p.owner_id = auth.uid())
);

create policy "agent_manage_listings" on public.listings
for all using (public.is_role('agent') = true and listed_by = auth.uid());

create policy "public_view_active_listings" on public.listings
for select using (is_active = true);

-- ── Notifications ─────────────────────────────────────────────────────

alter table public.notifications enable row level security;

create policy "owner_reads_notifications" on public.notifications
for select using (auth.uid() = user_id);

create policy "owner_updates_notifications" on public.notifications
for update using (auth.uid() = user_id);

create policy "admin_insert_notifications" on public.notifications
for insert with check (public.is_role('admin') = true or auth.role() = 'service_role');

-- ── AI insights ───────────────────────────────────────────────────────

alter table public.ai_insights enable row level security;

create policy "admin_full_insights" on public.ai_insights
for all using (public.is_role('admin') = true);

create policy "owner_reads_insights" on public.ai_insights
for select using (auth.uid() = generated_for);

create policy "service_inserts_insights" on public.ai_insights
for insert with check (auth.role() = 'service_role' or public.is_role('admin') = true);

-- ── Documents ─────────────────────────────────────────────────────────

alter table public.documents enable row level security;

create policy "admin_full_documents" on public.documents
for all using (public.is_role('admin') = true);

create policy "owner_documents" on public.documents
for all using (owner_id = auth.uid());
