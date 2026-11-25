import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersConsentMigration1795564800000 implements MigrationInterface {
  name = 'UsersConsentMigration1795564800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tb_users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "tb_users" ADD COLUMN IF NOT EXISTS "terms_version" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tb_users" ADD COLUMN IF NOT EXISTS "privacy_accepted_at" TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "tb_users" ADD COLUMN IF NOT EXISTS "privacy_version" character varying(20)`,
    );
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'Consent columns may predate this migration; refusing to drop potentially existing acceptance records.',
    );
  }
}
