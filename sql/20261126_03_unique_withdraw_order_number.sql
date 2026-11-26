-- A customer can submit only one withdrawal request per order number.
-- Table: tb_withdraw

CREATE UNIQUE INDEX IF NOT EXISTS "order_number"
  ON "tb_withdraw" ("order_number");

-- Rollback:
-- DROP INDEX IF EXISTS "order_number";
