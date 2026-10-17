-- ============================================================================
-- 0001: Provider-neutral external identity (Firebase Auth / Identity Platform)
-- Firebase uids are opaque strings, not UUIDs, so the column becomes TEXT.
-- Idempotent: safe to re-run after 0000.
-- ============================================================================
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'supabase_auth_id'
    ) THEN
        ALTER TABLE users RENAME COLUMN supabase_auth_id TO auth_provider_uid;
    END IF;
END $$;

ALTER TABLE users ALTER COLUMN auth_provider_uid TYPE TEXT USING auth_provider_uid::text;
