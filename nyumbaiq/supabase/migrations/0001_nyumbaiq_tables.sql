-- NyumbaIQ – Part 1: extensions, enums, functions, tables, triggers
-- All tables are created here so Part 2 (policies) can safely reference any table.

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Helper enums
create type public.user_role as enum ('admin','landlord','agent','tenant');
create type public.property_type as enum ('residential','commercial','mixed');
create type public.property_status as enum ('active','inactive','under_renovation');
create type public.unit_type as enum ('bedsitter','1br','2br','3br','penthouse','office','warehouse','retail','studio');
create type public.unit_status as enum ('vacant','occupied','reserved','under_maintenance');
create type public.lease_status as enum ('active','expired','terminated','pending_signature');
create type public.payment_method as enum ('mpesa','bank_transfer','cash','cheque');
create type public.payment_status as enum ('confirmed','partial','pending','failed','refunded');
create type public.maintenance_category as enum ('plumbing','electrical','structural','appliance','security','cleaning','pest_control','other');
create type public.maintenance_priority as enum ('low','medium','high','emergency');
create type public.maintenance_status as enum ('open','in_progress','awaiting_parts','resolved','closed');
create type public.listing_type as enum ('rent','sale','lease');
create type public.notification_type as enum ('rent_due','rent_paid','rent_overdue','maintenance_update','lease_expiring','new_listing','system_alert');
create type public.insight_type as enum ('vacancy','revenue','risk','market','maintenance','forecast');
create type public.insight_severity as enum ('info','warning','critical','opportunity');
create type public.related_entity as enum ('lease','payment','property','tenant','maintenance');
create type public.kenya_county as enum (
  'Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita-Taveta','Garissa','Wajir','Mandera','Marsabit',
  'Isiolo','Meru','Tharaka-Nithi','Embu','Kitui','Machakos','Makueni','Nyandarua','Nyeri','Kirinyaga',
  'Murang''a','Kiambu','Turkana','West Pokot','Samburu','Trans-Nzoia','Uasin Gishu','Elgeyo-Marakwet','Nandi',
  'Baringo','Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia',
  'Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira','Nairobi City'
);

-- ── Helper functions ──────────────────────────────────────────────────

create or replace function public.is_role(role_name user_role)
returns boolean
language sql stable
as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = role_name and p.is_active is true);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ── Tables ────────────────────────────────────────────────────────────

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text unique,
  phone text,
  role user_role not null default 'tenant',
  avatar_url text,
  county kenya_county,
  national_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.email, 'tenant');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger set_timestamp_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

-- 2. Properties
create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  description text,
  property_type property_type not null,
  county kenya_county not null,
  sub_county text,
  area_name text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  total_units integer,
  year_built integer,
  amenities jsonb default '[]'::jsonb,
  images text[] default '{}',
  is_listed_publicly boolean default false,
  status property_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_properties
before update on public.properties
for each row execute function public.set_updated_at();

-- 3. Units
create table public.units (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_number text not null,
  floor_number text,
  unit_type unit_type not null,
  size_sqft numeric,
  monthly_rent numeric not null,
  deposit_amount numeric,
  status unit_status not null default 'vacant',
  furnished boolean default false,
  features jsonb default '[]'::jsonb,
  images text[] default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_units
before update on public.units
for each row execute function public.set_updated_at();

-- 4. Leases
create table public.leases (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id),
  landlord_id uuid not null references public.profiles(id),
  start_date date not null,
  end_date date,
  monthly_rent numeric not null,
  deposit_paid numeric default 0,
  lease_terms text,
  payment_day integer not null check (payment_day between 1 and 28),
  auto_renew boolean default false,
  status lease_status not null default 'pending_signature',
  signed_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index leases_one_active_per_unit on public.leases(unit_id) where status = 'active';

create or replace function public.sync_unit_status_on_lease()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    if new.status = 'active' then
      update public.units set status = 'occupied', updated_at = timezone('utc', now()) where id = new.unit_id;
    end if;
  elsif (tg_op = 'UPDATE') then
    if new.status = 'active' and old.status <> 'active' then
      update public.units set status = 'occupied', updated_at = timezone('utc', now()) where id = new.unit_id;
    elsif new.status in ('expired','terminated') and old.status = 'active' then
      update public.units set status = 'vacant', updated_at = timezone('utc', now()) where id = new.unit_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leases_unit_sync on public.leases;
create trigger leases_unit_sync
after insert or update on public.leases
for each row execute function public.sync_unit_status_on_lease();

create trigger set_timestamp_leases
before update on public.leases
for each row execute function public.set_updated_at();

-- 5. Rent payments
create table public.rent_payments (
  id uuid primary key default uuid_generate_v4(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id),
  property_id uuid not null references public.properties(id),
  unit_id uuid not null references public.units(id),
  amount_expected numeric not null,
  amount_paid numeric,
  payment_method payment_method not null default 'mpesa',
  mpesa_code text,
  mpesa_phone text,
  mpesa_receipt_url text,
  payment_for_month date not null,
  payment_date timestamptz,
  status payment_status not null default 'pending',
  late_fee_applied numeric default 0,
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

-- 6. Bank transactions
create table public.bank_transactions (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid not null references public.profiles(id),
  property_id uuid references public.properties(id),
  transaction_ref text not null,
  bank_name text,
  account_number text,
  transaction_type text check (transaction_type in ('credit','debit')),
  amount numeric not null,
  description text,
  transaction_date date not null,
  linked_payment_id uuid references public.rent_payments(id),
  attachment_url text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 7. Maintenance requests
create table public.maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units(id),
  property_id uuid references public.properties(id),
  reported_by uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  category maintenance_category not null,
  title text not null,
  description text,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'open',
  images text[] default '{}',
  resolution_notes text,
  cost_incurred numeric,
  opened_at timestamptz default timezone('utc', now()),
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_maintenance
before update on public.maintenance_requests
for each row execute function public.set_updated_at();

-- 8. Listings
create table public.listings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid references public.units(id),
  listed_by uuid references public.profiles(id),
  title text not null,
  description text,
  listing_type listing_type not null,
  asking_price numeric,
  negotiable boolean default false,
  available_from date,
  highlights jsonb default '[]'::jsonb,
  virtual_tour_url text,
  cover_image_url text,
  gallery_urls text[] default '{}',
  views_count integer default 0,
  is_featured boolean default false,
  is_active boolean default true,
  expires_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_listings
before update on public.listings
for each row execute function public.set_updated_at();

-- 9. Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  type notification_type not null,
  title text not null,
  body text not null,
  is_read boolean default false,
  action_url text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 10. AI insights
create table public.ai_insights (
  id uuid primary key default uuid_generate_v4(),
  generated_for uuid references public.profiles(id),
  insight_type insight_type not null,
  title text not null,
  body text not null,
  severity insight_severity not null default 'info',
  data_snapshot jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

-- 11. Documents
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id),
  related_to related_entity not null,
  related_id uuid not null,
  document_type text,
  file_name text,
  file_url text not null,
  file_size_kb integer,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

-- ── Realtime ──────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.rent_payments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.maintenance_requests;

-- ── Indexes ───────────────────────────────────────────────────────────

create index if not exists idx_properties_owner on public.properties(owner_id);
create index if not exists idx_units_property on public.units(property_id);
create index if not exists idx_leases_unit on public.leases(unit_id);
create index if not exists idx_rent_payments_lease on public.rent_payments(lease_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
