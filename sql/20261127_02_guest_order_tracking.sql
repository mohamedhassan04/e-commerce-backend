-- Adds hashed access-token metadata for guest-only order tracking.
-- Table: tb_orders
-- Entity: src/modules/order/entities/order.entity.ts

ALTER TABLE "tb_orders"
  ADD COLUMN IF NOT EXISTS "guest_tracking_token_hash" character varying(64) NULL,
  ADD COLUMN IF NOT EXISTS "guest_tracking_expires_at" TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS "guest_tracking_revoked_at" TIMESTAMPTZ NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tb_orders_guest_tracking_token_hash"
  ON "tb_orders" ("guest_tracking_token_hash")
  WHERE "guest_tracking_token_hash" IS NOT NULL;

-- Rollback:
-- DROP INDEX IF EXISTS "UQ_tb_orders_guest_tracking_token_hash";
-- ALTER TABLE "tb_orders"
--   DROP COLUMN IF EXISTS "guest_tracking_revoked_at",
--   DROP COLUMN IF EXISTS "guest_tracking_expires_at",
--   DROP COLUMN IF EXISTS "guest_tracking_token_hash";