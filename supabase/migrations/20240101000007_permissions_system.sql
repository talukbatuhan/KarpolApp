-- Add permissions column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{
  "can_create_tables": false,
  "can_edit_tables": false,
  "can_delete_tables": false,
  "can_view_audit_logs": false,
  "can_manage_users": false
}'::jsonb;

-- Update admin users to have all permissions
UPDATE public.profiles 
SET permissions = '{
  "can_create_tables": true,
  "can_edit_tables": true,
  "can_delete_tables": true,
  "can_view_audit_logs": true,
  "can_manage_users": true
}'::jsonb
WHERE role = 'admin';

-- Function to check if user has permission
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

-- Update RLS policies for dynamic_tables to include delete
DROP POLICY IF EXISTS "Users can insert tables" ON public.dynamic_tables;
CREATE POLICY "Users can insert tables"
  ON public.dynamic_tables FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    public.has_permission(auth.uid(), 'can_create_tables')
  );

DROP POLICY IF EXISTS "Users can update own tables" ON public.dynamic_tables;
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
