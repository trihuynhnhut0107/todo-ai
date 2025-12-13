import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLocationAndReminder1765620753061 implements MigrationInterface {
    name = 'AddUserLocationAndReminder1765620753061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reminders_status_enum" AS ENUM('pending', 'sent', 'failed')`);
        await queryRunner.query(`CREATE TABLE "reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "eventId" uuid NOT NULL, "scheduledTime" TIMESTAMP NOT NULL, "status" "public"."reminders_status_enum" NOT NULL DEFAULT 'pending', "travelTimeSeconds" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "currentLat" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "currentLng" text`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_f8e4bc520d9e692652afaf3308b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_2b0a4f02adb0df858b37270d312" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_2b0a4f02adb0df858b37270d312"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_f8e4bc520d9e692652afaf3308b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentLng"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentLat"`);
        await queryRunner.query(`DROP TABLE "reminders"`);
        await queryRunner.query(`DROP TYPE "public"."reminders_status_enum"`);
    }

}
