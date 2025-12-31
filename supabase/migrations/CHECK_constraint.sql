-- STEP 1: Check current constraint status
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audit_logs' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'table_id';

-- EXPECTED OUTPUT:
-- delete_rule should be 'SET NULL' not 'NO ACTION' or 'CASCADE'
