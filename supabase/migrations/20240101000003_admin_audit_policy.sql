-- Allow Admins to view Audit Logs
create policy "Admins can view all audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Ensure profiles is publicly readable or at least readable by authenticated users so the check works
-- (Already exists: "Public profiles are viewable by everyone")
