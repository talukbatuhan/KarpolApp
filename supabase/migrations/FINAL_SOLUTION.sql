-- FINAL SOLUTION: Remove the problematic foreign key constraint completely
-- This allows audit logs to have NULL table_id without any issues

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_table_id_fkey CASCADE;

-- Step 2: Make sure table_id column allows NULL
ALTER TABLE public.audit_logs 
ALTER COLUMN table_id DROP NOT NULL;

-- Step 3: Verify
SELECT 
    'Foreign Key Status: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'audit_logs_table_id_fkey'
    ) THEN '❌ STILL EXISTS' ELSE '✅ REMOVED' END as status
UNION ALL
SELECT 
    'table_id nullable: ' ||
    CASE WHEN is_nullable = 'YES' 
    THEN '✅ YES' ELSE '❌ NO' END
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name = 'table_id';

-- That's it! Now try deleting a table.
