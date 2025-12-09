import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLatLngForEvent1765284386098 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD COLUMN "lat" text`);
        await queryRunner.query(`ALTER TABLE "events" ADD COLUMN "lng" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "lat"`);
    }

}
