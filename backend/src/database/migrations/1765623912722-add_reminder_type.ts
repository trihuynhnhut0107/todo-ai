import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReminderType1765623912722 implements MigrationInterface {
    name = 'AddReminderType1765623912722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reminders_type_enum" AS ENUM('location', 'time')`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD "type" "public"."reminders_type_enum" NOT NULL DEFAULT 'location'`);
        await queryRunner.query(`ALTER TABLE "reminders" ALTER COLUMN "travelTimeSeconds" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminders" ALTER COLUMN "travelTimeSeconds" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."reminders_type_enum"`);
    }

}
