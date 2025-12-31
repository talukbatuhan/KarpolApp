-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Managed by Supabase Auth but good to have a public wrapper or trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  avatar_url text,
  department text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DYNAMIC TABLES
create table if not exists public.dynamic_tables (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  columns_schema jsonb not null default '[]'::jsonb, -- Array of {id, name, type, options}
  is_template boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLE ROWS
create table if not exists public.table_rows (
  id uuid default uuid_generate_v4() primary key,
  table_id uuid references public.dynamic_tables(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb, -- The dynamic data
  row_order serial,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  entity_type text not null, -- 'TABLE' | 'ROW'
  entity_id uuid not null,
  table_id uuid references public.dynamic_tables(id) on delete set null,
  action text not null, -- 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLOVER'
  performed_by uuid references public.profiles(id) on delete set null,
  old_data jsonb,
  new_data jsonb,
  performed_at timestamptz default now()
);

-- RLS POLICIES

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.dynamic_tables enable row level security;
alter table public.table_rows enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- DYNAMIC TABLES Policies
create policy "Users can view tables they own or are admin"
  on public.dynamic_tables for select
  using ( 
    auth.uid() = owner_id OR 
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert tables"
  on public.dynamic_tables for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update own tables"
  on public.dynamic_tables for update
  using ( auth.uid() = owner_id );

create policy "Users can soft delete own tables"
  on public.dynamic_tables for update
  using ( auth.uid() = owner_id ); -- Soft delete is just an update to is_deleted

-- TABLE ROWS Policies
create policy "Users can view rows of tables they have access to"
  on public.table_rows for select
  using (
    exists (
      select 1 from public.dynamic_tables dt
      where dt.id = table_rows.table_id
      and (dt.owner_id = auth.uid() OR exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Users can insert rows to accessible tables"
  on public.table_rows for insert
  with check (
    exists (
      select 1 from public.dynamic_tables dt
      where dt.id = table_rows.table_id
      and (dt.owner_id = auth.uid() OR exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Users can update rows of accessible tables"
  on public.table_rows for update
  using (
    exists (
      select 1 from public.dynamic_tables dt
      where dt.id = table_rows.table_id
      and (dt.owner_id = auth.uid() OR exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- Trigger to handle new user signup -> Create Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
