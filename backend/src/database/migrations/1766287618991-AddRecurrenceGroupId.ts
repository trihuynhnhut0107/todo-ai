import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecurrenceGroupId1766287618991 implements MigrationInterface {
  name = "AddRecurrenceGroupId1766287618991";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD "recurrenceGroupId" uuid`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN "recurrenceGroupId"`
    );
  }
}
