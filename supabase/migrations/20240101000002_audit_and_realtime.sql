-- AUDIT LOG TRIGGER FUNCTION
create or replace function public.handle_audit_log()
returns trigger as $$
declare
  old_data jsonb;
  new_data jsonb;
  action_type text;
  entity_id uuid;
  table_ref_id uuid;
begin
  action_type = TG_OP;
  
  if (action_type = 'DELETE') then
    old_data = to_jsonb(OLD);
    new_data = null;
    entity_id = OLD.id;
    if (TG_TABLE_NAME = 'table_rows') then
        table_ref_id = OLD.table_id;
    elsif (TG_TABLE_NAME = 'dynamic_tables') then
        table_ref_id = OLD.id;
    end if;
  elsif (action_type = 'INSERT') then
    old_data = null;
    new_data = to_jsonb(NEW);
    entity_id = NEW.id;
    if (TG_TABLE_NAME = 'table_rows') then
        table_ref_id = NEW.table_id;
    elsif (TG_TABLE_NAME = 'dynamic_tables') then
        table_ref_id = NEW.id;
    end if;
  else -- UPDATE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    entity_id = NEW.id;
    if (TG_TABLE_NAME = 'table_rows') then
        table_ref_id = NEW.table_id;
    elsif (TG_TABLE_NAME = 'dynamic_tables') then
        table_ref_id = NEW.id;
    end if;
  end if;

  insert into public.audit_logs (
    entity_type,
    entity_id,
    table_id,
    action,
    performed_by,
    old_data,
    new_data
  )
  values (
    TG_TABLE_NAME, 
    entity_id,
    table_ref_id,
    action_type,
    auth.uid(),
    old_data,
    new_data
  );

  return null;
end;
$$ language plpgsql security definer;

-- ATTACH TRIGGERS
create trigger trigger_audit_dynamic_tables
after insert or update or delete on public.dynamic_tables
for each row execute procedure public.handle_audit_log();

create trigger trigger_audit_table_rows
after insert or update or delete on public.table_rows
for each row execute procedure public.handle_audit_log();

create trigger trigger_audit_tasks
after insert or update or delete on public.tasks
for each row execute procedure public.handle_audit_log();

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('table_assets', 'table_assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload files"
on storage.objects for insert
with check ( bucket_id = 'table_assets' and auth.role() = 'authenticated' );

create policy "Public can view files"
on storage.objects for select
using ( bucket_id = 'table_assets' );
