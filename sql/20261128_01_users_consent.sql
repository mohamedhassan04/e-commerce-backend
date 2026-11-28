-- Stores the accepted terms and privacy versions and timestamps.
-- Table: tb_users
-- Entity: src/modules/users/entities/user.entity.ts

ALTER TABLE "tb_users"
  ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS "terms_version" character varying(20) NULL,
  ADD COLUMN IF NOT EXISTS "privacy_accepted_at" TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS "privacy_version" character varying(20) NULL;

-- Rollback only if these columns were introduced by this migration and contain no consent data:
-- ALTER TABLE "tb_users"
--   DROP COLUMN IF EXISTS "privacy_version",
--   DROP COLUMN IF EXISTS "privacy_accepted_at",
--   DROP COLUMN IF EXISTS "terms_version",
--   DROP COLUMN IF EXISTS "terms_accepted_at";