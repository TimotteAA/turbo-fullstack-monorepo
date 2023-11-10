/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class JIcReM1699337838964 implements MigrationInterface {
    name = 'JIcReM1699337838964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_categories\` DROP COLUMN \`test\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_categories\` ADD \`test\` varchar(255) NOT NULL`);
    }

}

module.exports = JIcReM1699337838964
