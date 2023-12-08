/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class RgkxeP1701855009504 implements MigrationInterface {
    name = 'RgkxeP1701855009504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL COMMENT '用户名称', \`nickname\` varchar(100) NULL COMMENT '用户昵称', \`email\` varchar(255) NULL COMMENT '用户邮箱', \`phone\` varchar(255) NULL COMMENT '用户手机号', \`password\` varchar(255) NOT NULL COMMENT '用户密码', \`summary\` varchar(300) NULL COMMENT '用户简介', \`createtAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}

module.exports = RgkxeP1701855009504
