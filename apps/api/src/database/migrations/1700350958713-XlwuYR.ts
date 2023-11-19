/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class XlwuYR1700350958713 implements MigrationInterface {
    name = 'XlwuYR1700350958713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rbac_systems\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '部门名称', \`description\` varchar(255) NULL COMMENT '部门描述', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` (\`name\`), FULLTEXT INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '角色名称', \`description\` varchar(255) NULL COMMENT '角色描述', \`status\` varchar(255) NOT NULL COMMENT '角色状态' DEFAULT 'enabled', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_resources\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '资源名称', \`description\` varchar(255) NULL COMMENT '资源描述', \`type\` enum ('directory', 'menu', 'action') NOT NULL COMMENT '资源类型' DEFAULT 'menu', \`icon\` varchar(255) NULL COMMENT '用于侧边栏展示icon', \`path\` varchar(255) NULL COMMENT '菜单项路由路径', \`component\` varchar(255) NULL COMMENT '目录、菜单对应前端组件地址', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`external\` tinyint NULL COMMENT '是否外链' DEFAULT 0, \`show\` tinyint NULL COMMENT '是否显示在侧边栏中，用于目录或者菜单' DEFAULT 1, \`keepAlive\` tinyint NULL COMMENT '是否缓存，用于菜单项' DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`permission\` varchar(255) NULL COMMENT '权限标识', \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` ADD CONSTRAINT \`FK_15a76c16422b3c05fba06b6a0fe\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD CONSTRAINT \`FK_8f2f71e39f671afa71cadd56eb4\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP FOREIGN KEY \`FK_8f2f71e39f671afa71cadd56eb4\``);
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` DROP FOREIGN KEY \`FK_15a76c16422b3c05fba06b6a0fe\``);
        await queryRunner.query(`DROP TABLE \`rbac_resources\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP TABLE \`rbac_systems\``);
    }

}

module.exports = XlwuYR1700350958713
