/* eslint-disable import/no-import-module-exports */
        import { MigrationInterface, QueryRunner } from "typeorm";

class LXQGWo1700467142212 implements MigrationInterface {
    name = 'LXQGWo1700467142212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rbac_roles_resources_rbac_resources\` (\`rbacRolesId\` varchar(36) NOT NULL, \`rbacResourcesId\` varchar(36) NOT NULL, INDEX \`IDX_b509f84977db92343ae15e7de1\` (\`rbacRolesId\`), INDEX \`IDX_7896ef92e20eb1773c337ebdab\` (\`rbacResourcesId\`), PRIMARY KEY (\`rbacRolesId\`, \`rbacResourcesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_resources_rbac_resources\` ADD CONSTRAINT \`FK_b509f84977db92343ae15e7de16\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_resources_rbac_resources\` ADD CONSTRAINT \`FK_7896ef92e20eb1773c337ebdab1\` FOREIGN KEY (\`rbacResourcesId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_roles_resources_rbac_resources\` DROP FOREIGN KEY \`FK_7896ef92e20eb1773c337ebdab1\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_resources_rbac_resources\` DROP FOREIGN KEY \`FK_b509f84977db92343ae15e7de16\``);
        await queryRunner.query(`DROP INDEX \`IDX_7896ef92e20eb1773c337ebdab\` ON \`rbac_roles_resources_rbac_resources\``);
        await queryRunner.query(`DROP INDEX \`IDX_b509f84977db92343ae15e7de1\` ON \`rbac_roles_resources_rbac_resources\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles_resources_rbac_resources\``);
    }

}

module.exports = LXQGWo1700467142212
