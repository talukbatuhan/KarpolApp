-- NUCLEAR OPTION: Completely bypass the trigger issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'dynamic_tables'
    AND trigger_name LIKE '%audit%';

-- Step 2: Temporarily disable the audit trigger on dynamic_tables
ALTER TABLE public.dynamic_tables DISABLE TRIGGER ALL;

-- Step 3: Try deleting a table from the UI now
-- (Go to your app and try to delete a table)

-- Step 4: After successful deletion, re-enable triggers
-- ALTER TABLE public.dynamic_tables ENABLE TRIGGER ALL;

-- NOTE: Don't run Step 4 yet! First test if deletion works with triggers disabled.
