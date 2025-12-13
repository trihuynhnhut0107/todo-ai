import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLatLngForEvent1765284386098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "lat" text NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "lng" text NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "lng"`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "lat"`);
  }
}
