-- ULTIMATE FIX: Multiple approaches to solve table deletion issue
-- Run each section and check if table deletion works

-- ============================================
-- SOLUTION 1: Fix Foreign Key Constraint
-- ============================================

-- Drop and recreate with SET NULL
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_table_id_fkey CASCADE;
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_table_id_fkey 
FOREIGN KEY (table_id) 
REFERENCES public.dynamic_tables(id) 
ON DELETE SET NULL;

-- ============================================
-- SOLUTION 2: Update Trigger Function
-- ============================================

-- Update trigger to handle table deletion better
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  action_type text;
  entity_id uuid;
  table_ref_id uuid;
BEGIN
  action_type = TG_OP;
  
  IF (action_type = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    new_data = null;
    entity_id = OLD.id;
    IF (TG_TABLE_NAME = 'table_rows') THEN
        table_ref_id = OLD.table_id;
    ELSIF (TG_TABLE_NAME = 'dynamic_tables') THEN
        -- For table deletion, set table_ref_id to NULL since the table is being deleted
        table_ref_id = NULL;
    END IF;
  ELSIF (action_type = 'INSERT') THEN
    old_data = null;
    new_data = to_jsonb(NEW);
    entity_id = NEW.id;
    IF (TG_TABLE_NAME = 'table_rows') THEN
        table_ref_id = NEW.table_id;
    ELSIF (TG_TABLE_NAME = 'dynamic_tables') THEN
        table_ref_id = NEW.id;
    END IF;
  ELSE -- UPDATE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    entity_id = NEW.id;
    IF (TG_TABLE_NAME = 'table_rows') THEN
        table_ref_id = NEW.table_id;
    ELSIF (TG_TABLE_NAME = 'dynamic_tables') THEN
        table_ref_id = NEW.id;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    table_id,
    action,
    performed_by,
    old_data,
    new_data
  )
  VALUES (
    TG_TABLE_NAME,
    entity_id,
    table_ref_id,  -- This will be NULL for table deletions
    action_type,
    auth.uid(),
    old_data,
    new_data
  );

  IF (action_type = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SOLUTION 3: Temporarily Disable Trigger for Table Deletions
-- ============================================

-- Alternative: Disable trigger on dynamic_tables before deletion
-- This would require changing the delete function, not recommended

-- ============================================
-- SOLUTION 4: Make table_id column nullable if not already
-- ============================================

ALTER TABLE public.audit_logs ALTER COLUMN table_id DROP NOT NULL;

-- ============================================
-- Add Permissions and Policies (from original fix)
-- ============================================

-- Add permissions column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN permissions jsonb DEFAULT '{
          "can_create_tables": false,
          "can_edit_tables": false,
          "can_delete_tables": false,
          "can_view_audit_logs": false,
          "can_manage_users": false
        }'::jsonb;
    END IF;
END $$;

-- Update admin permissions
UPDATE public.profiles 
SET permissions = '{
  "can_create_tables": true,
  "can_edit_tables": true,
  "can_delete_tables": true,
  "can_view_audit_logs": true,
  "can_manage_users": true
}'::jsonb
WHERE role = 'admin';

-- Create permission function
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean AS $$
DECLARE
  user_permissions jsonb;
  user_role text;
BEGIN
  SELECT permissions, role INTO user_permissions, user_role
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  RETURN COALESCE((user_permissions->>permission_name)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can view tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can insert tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can update own tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can delete own tables" ON public.dynamic_tables;

-- Create policies
CREATE POLICY "Users can view tables"
  ON public.dynamic_tables FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Users can insert tables"
  ON public.dynamic_tables FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    public.has_permission(auth.uid(), 'can_create_tables')
  );

CREATE POLICY "Users can update own tables"
  ON public.dynamic_tables FOR UPDATE
  USING (
    (auth.uid() = owner_id AND public.has_permission(auth.uid(), 'can_edit_tables')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own tables"
  ON public.dynamic_tables FOR DELETE
  USING (
    (auth.uid() = owner_id AND public.has_permission(auth.uid(), 'can_delete_tables')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

ALTER TABLE public.dynamic_tables ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '==================== VERIFICATION ====================' as status
UNION ALL
SELECT 
    '✅ table_id nullable: ' || 
    CASE WHEN is_nullable = 'YES' 
    THEN 'YES' ELSE '❌ NO - Run Solution 4' END
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name = 'table_id'
UNION ALL
SELECT 
    '✅ FK constraint delete rule: ' || 
    COALESCE(rc.delete_rule, '❌ NOT FOUND')
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audit_logs' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name = 'audit_logs_table_id_fkey'
UNION ALL
SELECT 
    '✅ DELETE policy: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dynamic_tables' 
        AND policyname = 'Users can delete own tables'
    ) THEN 'EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    '✅ Admin users: ' || COUNT(*)::text
FROM public.profiles 
WHERE role = 'admin';
