import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPushToken1764499732901 implements MigrationInterface {
    name = 'AddPushToken1764499732901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_066163c46cda7e8187f96bc87a0"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "pushToken" text`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_066163c46cda7e8187f96bc87a0" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_066163c46cda7e8187f96bc87a0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pushToken"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_066163c46cda7e8187f96bc87a0" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
