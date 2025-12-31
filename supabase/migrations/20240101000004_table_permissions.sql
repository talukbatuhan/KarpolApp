
-- Create Table Permissions Table
create table if not exists public.table_permissions (
  id uuid default uuid_generate_v4() primary key,
  table_id uuid references public.dynamic_tables(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('viewer', 'editor')),
  created_at timestamptz default now(),
  unique(table_id, user_id)
);

-- Enable RLS
alter table public.table_permissions enable row level security;

-- Policies for table_permissions
-- Admins can manage everything
-- Owners can manage permissions for their tables
create policy "Admins and Owners can manage permissions"
  on public.table_permissions
  for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') OR
    exists (select 1 from public.dynamic_tables where id = table_permissions.table_id and owner_id = auth.uid())
  );

-- Users can view their own permissions (optional, but good for UI)
create policy "Users can view own permissions"
  on public.table_permissions
  for select
  using ( user_id = auth.uid() );


-- UPDATE EXISTING POLICIES

-- Dynamic Tables: Everyone can see the list (Metadata)
drop policy if exists "Users can view tables they own or are admin" on public.dynamic_tables;
create policy "Authenticated users can view all table definitions"
  on public.dynamic_tables for select
  to authenticated
  using ( true );

-- Table Rows: Visibility based on permission
drop policy if exists "Users can view rows of tables they have access to" on public.table_rows;
create policy "Users can view rows with permission"
  on public.table_rows for select
  using (
    exists (select 1 from public.dynamic_tables dt where dt.id = table_rows.table_id and dt.owner_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') OR
    exists (select 1 from public.table_permissions tp where tp.table_id = table_rows.table_id and tp.user_id = auth.uid())
  );

drop policy if exists "Users can insert rows to accessible tables" on public.table_rows;
create policy "Users can insert rows with editor permission"
  on public.table_rows for insert
  with check (
    exists (select 1 from public.dynamic_tables dt where dt.id = table_rows.table_id and dt.owner_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') OR
    exists (select 1 from public.table_permissions tp where tp.table_id = table_rows.table_id and tp.user_id = auth.uid() and tp.role = 'editor')
  );

drop policy if exists "Users can update rows of accessible tables" on public.table_rows;
create policy "Users can update rows with editor permission"
  on public.table_rows for update
  using (
    exists (select 1 from public.dynamic_tables dt where dt.id = table_rows.table_id and dt.owner_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') OR
    exists (select 1 from public.table_permissions tp where tp.table_id = table_rows.table_id and tp.user_id = auth.uid() and tp.role = 'editor')
  );

drop policy if exists "Users can delete rows of accessible tables" on public.table_rows;
create policy "Users can delete rows with editor permission"
  on public.table_rows for delete
  using (
    exists (select 1 from public.dynamic_tables dt where dt.id = table_rows.table_id and dt.owner_id = auth.uid()) OR
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') OR
    exists (select 1 from public.table_permissions tp where tp.table_id = table_rows.table_id and tp.user_id = auth.uid() and tp.role = 'editor')
  );
