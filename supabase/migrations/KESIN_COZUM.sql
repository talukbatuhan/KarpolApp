-- ======================================================
-- KESIN ÇÖZÜM: Tablo Silme Sorunu
-- ======================================================
-- Bu script constraint'i kesinlikle kaldıracak
-- Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut constraint'leri listeleyelim
SELECT 
    con.conname as constraint_name,
    con.contype as constraint_type,
    CASE con.contype
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
    END as type_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'audit_logs' 
    AND con.contype = 'f';  -- sadece foreign key'ler

-- 2. Tüm foreign key constraint'lerini kaldır (audit_logs tablosunda)
DO $$ 
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'audit_logs' 
            AND con.contype = 'f'
            AND con.conname LIKE '%table_id%'
    LOOP
        EXECUTE 'ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS ' || constraint_rec.conname || ' CASCADE';
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.conname;
    END LOOP;
END $$;

-- 3. table_id kolonunu nullable yap
ALTER TABLE public.audit_logs 
ALTER COLUMN table_id DROP NOT NULL;

-- 4. Trigger'ı da kaldır (artık manuel log oluşturuyoruz)
DROP TRIGGER IF EXISTS handle_audit_log_trigger ON public.dynamic_tables CASCADE;

-- 5. Verification
SELECT '========== VERİFİCATİON ==========' as status
UNION ALL
SELECT 
    'Kalan FK Constraints: ' || COUNT(*)::text
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'audit_logs' AND con.contype = 'f'
UNION ALL
SELECT 
    'table_id nullable: ' ||
    CASE WHEN is_nullable = 'YES' THEN '✅ YES' ELSE '❌ NO' END
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name = 'table_id'
UNION ALL
SELECT 
    'Trigger: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE event_object_table = 'dynamic_tables'
        AND trigger_name = 'handle_audit_log_trigger'
    ) THEN '❌ STILL EXISTS' ELSE '✅ REMOVED' END;

-- EXPECTED OUTPUT:
-- Kalan FK Constraints: 0
-- table_id nullable: ✅ YES  
-- Trigger: ✅ REMOVED
