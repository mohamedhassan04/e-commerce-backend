-- Adds the timestamp that is set when an order is marked as shipped.
-- Table: tb_orders
-- Entity: src/modules/order/entities/order.entity.ts

ALTER TABLE "tb_orders"
  ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP NULL;

-- Rollback:
-- ALTER TABLE "tb_orders" DROP COLUMN IF EXISTS "delivered_at";
