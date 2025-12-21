import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCalendarEventId1766326364261 implements MigrationInterface {
  name = "AddCalendarEventId1766326364261";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" ADD "calendarEventId" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN "calendarEventId"`
    );
  }
}
