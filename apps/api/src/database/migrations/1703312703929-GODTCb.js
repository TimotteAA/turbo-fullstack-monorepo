/* eslint-disable import/no-import-module-exports */
        

class GODTCb1703312703929 {
    name = 'GODTCb1703312703929'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD \`authorId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`authorId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_4a3469cba32f2dd9712821285e5\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_8fcc2d81ced7b8ade2bbd151b1a\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_8fcc2d81ced7b8ade2bbd151b1a\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_4a3469cba32f2dd9712821285e5\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`authorId\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`authorId\``);
    }

}

module.exports = GODTCb1703312703929
