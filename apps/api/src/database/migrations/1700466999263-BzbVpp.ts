/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class BzbVpp1700466999263 implements MigrationInterface {
    name = 'BzbVpp1700466999263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`deletedAt\` \`customOrder\` datetime(6) NULL COMMENT '删除时间'`);
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`ALTER TABLE \`content_tags\` CHANGE \`customOrder\` \`deletedAt\` datetime(6) NULL COMMENT '删除时间'`);
    }

}

module.exports = BzbVpp1700466999263
