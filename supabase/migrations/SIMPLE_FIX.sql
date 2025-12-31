-- SIMPLE FIX: Disable audit trigger on dynamic_tables
-- Run this in Supabase SQL Editor

-- Disable the trigger that's causing the issue
DROP TRIGGER IF EXISTS handle_audit_log_trigger ON public.dynamic_tables;

-- Optionally: If you still want audit logs for table operations,
-- we can recreate it with better logic later

-- Verify trigger is disabled
SELECT 
    'Trigger Status: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE event_object_table = 'dynamic_tables'
        AND trigger_name = 'handle_audit_log_trigger'
    ) THEN '❌ STILL EXISTS' ELSE '✅ DISABLED' END as status;
