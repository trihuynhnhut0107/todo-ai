import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventAndWorkspace1760855922770 implements MigrationInterface {
    name = 'AddEventAndWorkspace1760855922770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "timezoneCode" character varying NOT NULL DEFAULT 'UTC', "color" character varying NOT NULL DEFAULT '#3B82F6', "icon" character varying, "isArchived" boolean NOT NULL DEFAULT false, "metadata" jsonb, "ownerId" uuid NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'scheduled', "location" text, "color" character varying NOT NULL DEFAULT '#3B82F6', "isAllDay" boolean NOT NULL DEFAULT false, "recurrenceRule" text, "tags" jsonb, "metadata" jsonb, "workspaceId" uuid NOT NULL, "createdById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspace_members" ("workspaceId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_99bcb5fdac446371d41f048b24f" PRIMARY KEY ("workspaceId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0dd45cb52108d0664df4e7e33e" ON "workspace_members" ("workspaceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_22176b38813258c2aadaae3244" ON "workspace_members" ("userId") `);
        await queryRunner.query(`CREATE TABLE "event_assignees" ("eventId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_c6918ffb22a0f7bb40e8420891b" PRIMARY KEY ("eventId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_630b2efdd9a0bee3cbaed13e8f" ON "event_assignees" ("eventId") `);
        await queryRunner.query(`CREATE INDEX "IDX_31dc3919af7ff4e3114f820571" ON "event_assignees" ("userId") `);
        await queryRunner.query(`ALTER TABLE "workspaces" ADD CONSTRAINT "FK_77607c5b6af821ec294d33aab0c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_87e4848c60e961425a711cc1d6c" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_2fb864f37ad210f4295a09b684d" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_0dd45cb52108d0664df4e7e33e6" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_22176b38813258c2aadaae32448" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "event_assignees" ADD CONSTRAINT "FK_630b2efdd9a0bee3cbaed13e8f3" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "event_assignees" ADD CONSTRAINT "FK_31dc3919af7ff4e3114f8205716" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_assignees" DROP CONSTRAINT "FK_31dc3919af7ff4e3114f8205716"`);
        await queryRunner.query(`ALTER TABLE "event_assignees" DROP CONSTRAINT "FK_630b2efdd9a0bee3cbaed13e8f3"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_22176b38813258c2aadaae32448"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_0dd45cb52108d0664df4e7e33e6"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_2fb864f37ad210f4295a09b684d"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_87e4848c60e961425a711cc1d6c"`);
        await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT "FK_77607c5b6af821ec294d33aab0c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31dc3919af7ff4e3114f820571"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_630b2efdd9a0bee3cbaed13e8f"`);
        await queryRunner.query(`DROP TABLE "event_assignees"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22176b38813258c2aadaae3244"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dd45cb52108d0664df4e7e33e"`);
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
    }

}
