/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class LifeSH1700192348571 implements MigrationInterface {
    name = 'LifeSH1700192348571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`deletedAt\` \`customOrder\` datetime(6) NULL COMMENT '删除时间'`);
        await queryRunner.query(`CREATE TABLE \`rbac_resources\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '资源名称', \`key\` varchar(255) NOT NULL COMMENT '资源键', \`description\` varchar(255) NULL COMMENT '资源描述', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`systemId\` varchar(36) NULL, \`parentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '角色名称', \`description\` varchar(255) NULL COMMENT '角色描述', \`status\` varchar(255) NOT NULL COMMENT '角色状态' DEFAULT 'enabled', \`createtAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatetAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`systemId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_systems\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '部门名称', \`description\` varchar(255) NULL COMMENT '部门描述', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` (\`name\`), FULLTEXT INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`content_categories\` CHANGE \`customOrder\` \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX \`IDX_5f70a0489331d4346e46ea4d88\` ON \`content_comments\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`body\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD \`body\` varchar(255) NOT NULL COMMENT '评论内容'`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL COMMENT '评论发表时间' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`name\` \`name\` varchar(255) NOT NULL COMMENT '标签名称'`);
        await queryRunner.query(`ALTER TABLE \`content_tags\` DROP COLUMN \`customOrder\``);
        await queryRunner.query(`ALTER TABLE \`content_tags\` ADD \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` CHANGE \`type\` \`type\` varchar(255) NOT NULL COMMENT '文章类型' DEFAULT 'md'`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`IDX_5f70a0489331d4346e46ea4d88\` ON \`content_comments\` (\`body\`)`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD CONSTRAINT \`FK_1cc821c9a6c0fc25117959e9957\` FOREIGN KEY (\`systemId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD CONSTRAINT \`FK_8f2f71e39f671afa71cadd56eb4\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD CONSTRAINT \`FK_9979ff93a1ad27bba6f380cade3\` FOREIGN KEY (\`systemId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` ADD CONSTRAINT \`FK_15a76c16422b3c05fba06b6a0fe\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` DROP FOREIGN KEY \`FK_15a76c16422b3c05fba06b6a0fe\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP FOREIGN KEY \`FK_9979ff93a1ad27bba6f380cade3\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP FOREIGN KEY \`FK_8f2f71e39f671afa71cadd56eb4\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP FOREIGN KEY \`FK_1cc821c9a6c0fc25117959e9957\``);
        await queryRunner.query(`DROP INDEX \`IDX_5f70a0489331d4346e46ea4d88\` ON \`content_comments\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` CHANGE \`type\` \`type\` varchar(255) NOT NULL COMMENT '文章类型' DEFAULT 'markdown'`);
        await queryRunner.query(`ALTER TABLE \`content_tags\` DROP COLUMN \`customOrder\``);
        await queryRunner.query(`ALTER TABLE \`content_tags\` ADD \`customOrder\` datetime(6) NULL COMMENT '删除时间'`);
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`name\` \`name\` varchar(255) NOT NULL COMMENT '分类名称'`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`body\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD \`body\` text NOT NULL COMMENT '评论内容'`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`IDX_5f70a0489331d4346e46ea4d88\` ON \`content_comments\` (\`body\`)`);
        await queryRunner.query(`ALTER TABLE \`content_categories\` CHANGE \`customOrder\` \`customOrder\` int NOT NULL COMMENT '分类排序' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`customOrder\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP TABLE \`rbac_systems\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles\``);
        await queryRunner.query(`DROP TABLE \`rbac_resources\``);
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`customOrder\` \`deletedAt\` datetime(6) NULL COMMENT '删除时间'`);
    }

}

module.exports = LifeSH1700192348571
