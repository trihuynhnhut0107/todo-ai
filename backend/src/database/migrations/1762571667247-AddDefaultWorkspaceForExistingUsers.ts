import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultWorkspaceForExistingUsers1762571667247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all existing users
        const users = await queryRunner.query(`SELECT id FROM users`);

        // Create a "Default" workspace for each user
        for (const user of users) {
            await queryRunner.query(
                `INSERT INTO workspaces (name, description, "timezoneCode", color, "isArchived", "ownerId", "order", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [
                    'Default',
                    'Default workspace for events',
                    'UTC',
                    '#3B82F6',
                    false,
                    user.id,
                    0
                ]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all "Default" workspaces
        await queryRunner.query(`DELETE FROM workspaces WHERE name = 'Default'`);
    }

}
