-- Create a dedicated TASKS table for robust management and rollover logic
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text not null default 'todo', -- 'todo', 'in_progress', 'done', 'rolled_over'
  priority text default 'medium', -- 'low', 'medium', 'high'
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_deleted boolean default false
);

-- RLS for Tasks
alter table public.tasks enable row level security;

create policy "Users can view tasks assigned to them or created by them"
  on public.tasks for select
  using (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert tasks"
  on public.tasks for insert
  with check ( auth.uid() = created_by );

create policy "Users can update own tasks"
  on public.tasks for update
  using ( 
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- EDGE FUNCTION PREP: Rollover Logic needs a way to filter
-- We will use the 'status' and 'due_date' columns.
