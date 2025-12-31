-- Fix for table deletion - handles foreign key constraints and audit logs
-- Run this in Supabase SQL Editor

-- Step 1: Fix audit_logs foreign key constraint
-- Drop the existing constraint
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_table_id_fkey;

-- Add it back with ON DELETE SET NULL (so audit logs are preserved when table is deleted)
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_table_id_fkey 
FOREIGN KEY (table_id) 
REFERENCES public.dynamic_tables(id) 
ON DELETE SET NULL;

-- Step 2: Add permissions column if not exists
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

-- Step 3: Update admin users to have all permissions
UPDATE public.profiles 
SET permissions = '{
  "can_create_tables": true,
  "can_edit_tables": true,
  "can_delete_tables": true,
  "can_view_audit_logs": true,
  "can_manage_users": true
}'::jsonb
WHERE role = 'admin';

-- Step 4: Create permission check function
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean AS $$
DECLARE
  user_permissions jsonb;
  user_role text;
BEGIN
  SELECT permissions, role INTO user_permissions, user_role
  FROM public.profiles
  WHERE id = user_id;
  
  -- Admins always have all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN COALESCE((user_permissions->>permission_name)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Drop existing policies
DROP POLICY IF EXISTS "Users can view own tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can view tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can insert tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can update own tables" ON public.dynamic_tables;
DROP POLICY IF EXISTS "Users can delete own tables" ON public.dynamic_tables;

-- Step 6: Create comprehensive RLS policies for dynamic_tables

-- SELECT policy
CREATE POLICY "Users can view tables"
  ON public.dynamic_tables FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- INSERT policy
CREATE POLICY "Users can insert tables"
  ON public.dynamic_tables FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    public.has_permission(auth.uid(), 'can_create_tables')
  );

-- UPDATE policy
CREATE POLICY "Users can update own tables"
  ON public.dynamic_tables FOR UPDATE
  USING (
    (auth.uid() = owner_id AND public.has_permission(auth.uid(), 'can_edit_tables')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE policy (CRITICAL!)
CREATE POLICY "Users can delete own tables"
  ON public.dynamic_tables FOR DELETE
  USING (
    (auth.uid() = owner_id AND public.has_permission(auth.uid(), 'can_delete_tables')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable RLS if not already enabled
ALTER TABLE public.dynamic_tables ENABLE ROW LEVEL SECURITY;

-- Verify the setup
SELECT 
    '✅ Audit logs FK constraint: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_logs_table_id_fkey'
    ) THEN 'FIXED (ON DELETE SET NULL)' ELSE '❌ NOT FOUND' END as status
UNION ALL
SELECT 
    '✅ Permissions column: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'permissions'
    ) THEN 'EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    '✅ Admin permissions: ' || 
    COUNT(*)::text || ' admin(s) updated'
FROM public.profiles 
WHERE role = 'admin'
UNION ALL
SELECT 
    '✅ DELETE policy: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dynamic_tables' 
        AND policyname = 'Users can delete own tables'
    ) THEN 'CREATED' ELSE '❌ MISSING' END;
