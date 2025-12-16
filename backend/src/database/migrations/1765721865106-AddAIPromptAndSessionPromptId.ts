import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAIPromptAndSessionPromptId1765721865106 implements MigrationInterface {
    name = 'AddAIPromptAndSessionPromptId1765721865106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_prompts_type_enum" AS ENUM('system', 'user_preference')`);
        await queryRunner.query(`CREATE TABLE "ai_prompts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "promptText" text NOT NULL, "type" "public"."ai_prompts_type_enum" NOT NULL DEFAULT 'system', "originSessionId" character varying, "evaluationResult" jsonb, "previousPromptId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c773812908b6563a53c47144e7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "promptId" uuid`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD CONSTRAINT "FK_4d756fb54c2ade2c040ce08902e" FOREIGN KEY ("previousPromptId") REFERENCES "ai_prompts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_5f09a18d2577ecdda873f4b9e94" FOREIGN KEY ("promptId") REFERENCES "ai_prompts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_5f09a18d2577ecdda873f4b9e94"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP CONSTRAINT "FK_4d756fb54c2ade2c040ce08902e"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "promptId"`);
        await queryRunner.query(`DROP TABLE "ai_prompts"`);
        await queryRunner.query(`DROP TYPE "public"."ai_prompts_type_enum"`);
    }

}
