-- Creates the withdrawal from contract requests table.
-- Table: tb_withdraw
-- Entity: src/modules/withdraw/entities/withdraw.entity.ts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  CREATE TYPE "tb_withdraw_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "tb_withdraw" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying(255) NOT NULL,
  "email" character varying(255) NOT NULL,
  "order_number" character varying(30) NOT NULL,
  "status" "tb_withdraw_status_enum" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_tb_withdraw_id" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "name" ON "tb_withdraw" ("name");
CREATE INDEX IF NOT EXISTS "email" ON "tb_withdraw" ("email");

-- Rollback:
-- DROP TABLE IF EXISTS "tb_withdraw";
-- DROP TYPE IF EXISTS "tb_withdraw_status_enum";
