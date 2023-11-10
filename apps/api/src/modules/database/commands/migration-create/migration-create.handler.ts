import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';
import { Arguments } from 'yargs';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { DbOptions, MigrationCreateArguments } from '../../types';

import { TypeormMigrationCreateRunner } from './migration-create.runner';

export const MigrationCreateHandler = async (
    configure: Configure,
    args: Arguments<MigrationCreateArguments>,
) => {
    const spinner = ora('开始创建迁移').start();
    const cname = args.connection ?? 'default';
    try {
        spinner.start();
        const database = await configure.get<DbOptions>('database');
        if (isNil(database)) throw new Error('数据库连接没有配置');
        const connection = database.connections.find((c) => c.name === cname);
        if (isNil(connection)) throw new Error(`数据库连接：${args.connection}没有配置`);
        const runner = new TypeormMigrationCreateRunner();
        console.log();
        await runner.run({
            cname: args.name ?? cname,
            dir: connection.paths.migration,
        });
        spinner.succeed(chalk.greenBright.underline('\n 👍 成功创建迁移'));
    } catch (err) {
        panic({ spinner, message: '创建迁移失败！', error: err });
    }
};
