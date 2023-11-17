/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class YgCLEo1700200882726 implements MigrationInterface {
    name = 'YgCLEo1700200882726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`createtAt\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`updatetAt\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`updatetAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`createtAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}

module.exports = YgCLEo1700200882726
