/* eslint-disable import/no-import-module-exports */
        

class JDyGNV1702883567876 {
    name = 'JDyGNV1702883567876'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`actived\` tinyint NOT NULL COMMENT '用户是否启用' DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` CHANGE \`systemed\` \`systemed\` tinyint NOT NULL COMMENT '是否为系统角色' DEFAULT 0`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` CHANGE \`systemed\` \`systemed\` tinyint NOT NULL COMMENT '是否为系统角色' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`actived\``);
    }

}

module.exports = JDyGNV1702883567876
