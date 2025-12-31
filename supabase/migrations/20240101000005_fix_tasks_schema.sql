
-- Add assigned_department to tasks table
alter table public.tasks 
add column if not exists assigned_department text;

-- Update RLS to allow department based view (Optional but good)
-- If a user is in a department, they should see tasks for that department?
-- For now, let's keep it simple: just adding the column.

create policy "Users can view tasks of their department"
  on public.tasks for select
  using (
    assigned_department = (select department from profiles where id = auth.uid()) OR
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
-- Note: You might need to drop the old select policy "Users can view tasks assigned to them or created by them" if this conflicts or overlaps excessively, but multiple policies are OR-ed, so it's fine.
