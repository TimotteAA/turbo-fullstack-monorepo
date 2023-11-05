import path from 'path';

import chalk from 'chalk';

const { CommandUtils } = require('typeorm/commands/CommandUtils');
const { PlatformTools } = require('typeorm/platform/PlatformTools');
const { camelCase } = require('typeorm/util/StringUtils');

type RunnerOptions = { cname: string; dir: string };

export class TypeormMigrationCreateRunner {
    async run({ cname, dir }: RunnerOptions) {
        try {
            const timestamp = new Date().getTime();
            // 保存路径
            const directory = dir.startsWith('/') ? dir : path.resolve(process.cwd(), dir);
            // 迁移文件名称
            const filename = `${timestamp}-${cname}`;
            const fullPath = `${directory}/${filename}`;

            const fileContent = TypeormMigrationCreateRunner.getTemplate(cname, timestamp);

            await CommandUtils.createFile(`${fullPath}.ts`, fileContent);
            console.log(
                `Migration ${chalk.blue(`${fullPath}.ts`)} has been generated successfully.`,
            );
        } catch (err) {
            PlatformTools.logCmdErr('Error during migration creation:', err);
            process.exit(1);
        }
    }

    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------

    /**
     * Gets contents of the migration file.
     */
    protected static getTemplate(name: string, timestamp: number): string {
        return `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${camelCase(name, true)}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
`;
    }
}
