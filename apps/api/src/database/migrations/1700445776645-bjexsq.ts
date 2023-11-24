/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class Bjexsq1700445776645 implements MigrationInterface {
    name = 'Bjexsq1700445776645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP FOREIGN KEY \`FK_9979ff93a1ad27bba6f380cade3\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP FOREIGN KEY \`FK_1cc821c9a6c0fc25117959e9957\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`systemId\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`key\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`systemId\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`type\` enum ('directory', 'menu', 'action') NOT NULL COMMENT '资源类型' DEFAULT 'menu'`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`icon\` varchar(255) NULL COMMENT '用于侧边栏展示icon'`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`path\` varchar(255) NULL COMMENT '菜单项路由路径'`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`component\` varchar(255) NULL COMMENT '目录、菜单对应前端组件地址'`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`external\` tinyint NULL COMMENT '是否外链' DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`show\` tinyint NULL COMMENT '是否显示在侧边栏中，用于目录或者菜单' DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`keepAlive\` tinyint NULL COMMENT '是否缓存，用于菜单项' DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`permission\` varchar(255) NULL COMMENT '权限标识'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`permission\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`keepAlive\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`show\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`external\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`component\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`path\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`icon\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`systemId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD \`key\` varchar(255) NOT NULL COMMENT '资源键'`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`systemId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD CONSTRAINT \`FK_1cc821c9a6c0fc25117959e9957\` FOREIGN KEY (\`systemId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD CONSTRAINT \`FK_9979ff93a1ad27bba6f380cade3\` FOREIGN KEY (\`systemId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

module.exports = Bjexsq1700445776645
