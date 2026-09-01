import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderShippingAddress1725000000000
  implements MigrationInterface
{
  name = 'AddOrderShippingAddress1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the new table
    await queryRunner.query(`
      CREATE TABLE "tb_order_shipping_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "street" varchar(255),
        "city" varchar(100),
        "state" varchar(100),
        "zip_code" varchar(20),
        "country" varchar(100),
        "phone_number" varchar(20),
        "order_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_order_shipping_addresses_order_id" UNIQUE ("order_id"),
        CONSTRAINT "PK_order_shipping_addresses" PRIMARY KEY ("id")
      )
    `);

    // 2. FK to tb_orders
    await queryRunner.query(`
      ALTER TABLE "tb_order_shipping_addresses"
      ADD CONSTRAINT "FK_order_shipping_addresses_order_id"
      FOREIGN KEY ("order_id") REFERENCES "tb_orders"("id") ON DELETE CASCADE
    `);

    // 3. Insert snapshot for EVERY existing order
    //    - If address_id exists → copy from tb_addresses
    //    - Else if manual_address_street exists → use manual values
    //    - Else → leave NULL
    //    Same logic for phone_number.
    await queryRunner.query(`
      INSERT INTO "tb_order_shipping_addresses"
        ("street", "city", "state", "zip_code", "country", "phone_number", "order_id", "created_at", "updated_at")
      SELECT
        COALESCE(o."manual_address_street", a."street"),
        COALESCE(o."manual_address_city", a."city"),
        COALESCE(o."manual_address_state", a."state"),
        COALESCE(o."manual_address_zip_code", a."zip_code"),
        COALESCE(o."manual_address_country", a."country"),
        COALESCE(o."manual_phone_number", p."phone_number"),
        o."id",
        o."created_at",
        o."updated_at"
      FROM "tb_orders" o
      LEFT JOIN "tb_addresses" a ON o."address_id" = a."id"
      LEFT JOIN "tb_phone_numbers" p ON o."phone_number_id" = p."id"
    `);

    // 4. Drop old columns
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_address_street"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_address_city"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_address_state"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_address_zip_code"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_address_country"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "manual_phone_number"`);

    // 5. Drop FKs and columns for address_id / phone_number_id
    //    First find and drop the FK constraints (names may vary)
    const fkResult = await queryRunner.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'tb_orders'::regclass
        AND contype = 'f'
        AND (conname LIKE '%address%' OR conname LIKE '%phone%')
    `);

    for (const row of fkResult) {
      await queryRunner.query(
        `ALTER TABLE "tb_orders" DROP CONSTRAINT "${row.conname}"`,
      );
    }

    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "address_id"`);
    await queryRunner.query(`ALTER TABLE "tb_orders" DROP COLUMN "phone_number_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate old columns
    await queryRunner.query(`
      ALTER TABLE "tb_orders"
      ADD COLUMN "address_id" uuid,
      ADD COLUMN "phone_number_id" uuid,
      ADD COLUMN "manual_address_street" varchar(255),
      ADD COLUMN "manual_address_city" varchar(100),
      ADD COLUMN "manual_address_state" varchar(100),
      ADD COLUMN "manual_address_zip_code" varchar(20),
      ADD COLUMN "manual_address_country" varchar(100),
      ADD COLUMN "manual_phone_number" varchar(20)
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_orders"
      ADD CONSTRAINT "FK_orders_address_id"
      FOREIGN KEY ("address_id") REFERENCES "tb_addresses"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_orders"
      ADD CONSTRAINT "FK_orders_phone_number_id"
      FOREIGN KEY ("phone_number_id") REFERENCES "tb_phone_numbers"("id") ON DELETE SET NULL
    `);

    // Restore data from shipping addresses into manual columns
    await queryRunner.query(`
      UPDATE "tb_orders" o
      SET
        "manual_address_street" = sa."street",
        "manual_address_city" = sa."city",
        "manual_address_state" = sa."state",
        "manual_address_zip_code" = sa."zip_code",
        "manual_address_country" = sa."country",
        "manual_phone_number" = sa."phone_number"
      FROM "tb_order_shipping_addresses" sa
      WHERE o."id" = sa."order_id"
    `);

    // Drop shipping address table
    await queryRunner.query(
      `ALTER TABLE "tb_order_shipping_addresses" DROP CONSTRAINT "FK_order_shipping_addresses_order_id"`,
    );
    await queryRunner.query(`DROP TABLE "tb_order_shipping_addresses"`);
  }
}
