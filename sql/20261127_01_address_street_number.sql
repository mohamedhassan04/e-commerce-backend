-- Removes state, country and apt/suite from addresses and adds a street number.
-- Tables: tb_addresses, tb_order_shipping_addresses
-- Entities: src/modules/users/entities/address.entity.ts
--           src/modules/order/entities/order-shipping-address.entity.ts

-- Saved addresses
ALTER TABLE "tb_addresses"
  ADD COLUMN IF NOT EXISTS "street_number" character varying(20) NOT NULL DEFAULT '';

ALTER TABLE "tb_addresses"
  DROP COLUMN IF EXISTS "apt",
  DROP COLUMN IF EXISTS "state",
  DROP COLUMN IF EXISTS "country";

-- Order shipping address snapshots
ALTER TABLE "tb_order_shipping_addresses"
  ADD COLUMN IF NOT EXISTS "street_number" character varying(20) NOT NULL DEFAULT '';

ALTER TABLE "tb_order_shipping_addresses"
  DROP COLUMN IF EXISTS "state",
  DROP COLUMN IF EXISTS "country";

-- Rollback:
-- ALTER TABLE "tb_addresses"
--   ADD COLUMN IF NOT EXISTS "apt" character varying(255) NULL,
--   ADD COLUMN IF NOT EXISTS "state" character varying(100) NOT NULL DEFAULT '',
--   ADD COLUMN IF NOT EXISTS "country" character varying(100) NOT NULL DEFAULT '';
-- ALTER TABLE "tb_addresses" DROP COLUMN IF EXISTS "street_number";
--
-- ALTER TABLE "tb_order_shipping_addresses"
--   ADD COLUMN IF NOT EXISTS "state" character varying(100) NOT NULL DEFAULT '',
--   ADD COLUMN IF NOT EXISTS "country" character varying(100) NOT NULL DEFAULT '';
-- ALTER TABLE "tb_order_shipping_addresses" DROP COLUMN IF EXISTS "street_number";
