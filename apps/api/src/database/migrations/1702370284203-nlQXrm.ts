/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class NlQXrm1702370284203 implements MigrationInterface {
    name = 'NlQXrm1702370284203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`label\` varchar(255) NULL COMMENT '角色显示名称'`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`systemed\` tinyint NOT NULL COMMENT '是否为系统角色' DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`label\` varchar(255) NULL COMMENT '资源显示名称'`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`rule\` text NOT NULL COMMENT '具体的权限规则'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`rule\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`label\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`systemed\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`label\``);
    }

}

module.exports = NlQXrm1702370284203
