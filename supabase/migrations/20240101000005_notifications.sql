
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text,
  type text default 'info', -- 'info', 'success', 'warning', 'error'
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update own notifications"
  on public.notifications for update
  using ( auth.uid() = user_id );
