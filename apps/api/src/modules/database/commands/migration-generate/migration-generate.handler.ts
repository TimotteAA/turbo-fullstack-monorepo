import chalk from 'chalk';
import { isNil, pick } from 'lodash';
import ora from 'ora';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { getRandomCharString, panic } from '@/modules/core/utils';

import { DbOptions, MigrationGenerateArguments } from '../../types';
import { MigrationRunHandler } from '../migration-run/migration-run.handler';

import { TypeormMigrationGenerate } from './migration-generate.runner';

export const MigrationGenerateHandler = async (
    configure: Configure,
    args: MigrationGenerateArguments,
) => {
    // 防止本地和服务器的数据库表结构有差异
    await MigrationRunHandler(configure, { connection: args.connection } as any);
    console.log();
    const spinner = ora('Start to generate migration');
    // 数据库连接名
    const cname = args.connection ?? 'default';
    try {
        spinner.start();
        console.log();
        const { connections = [] }: DbOptions = await configure.get<DbOptions>('database');
        const dbConfig = connections.find(({ name }) => name === cname);
        console.log('dbConfig ', dbConfig);
        if (isNil(dbConfig))
            panic({ error: `Database connection named ${cname} does not exist`, spinner });
        console.log();
        // 创建数据库连接
        const dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);
        // 运行runner
        // args.connection -> 处理成了dataSource
        // dir来自于数据库本身的配置
        const runner = new TypeormMigrationGenerate();
        console.log();
        await runner.handler({
            name: args.name ?? getRandomCharString(6),
            dir: dbConfig.paths.migration,
            dataSource,
            ...pick(args, ['pretty', 'dryrun', 'check']),
        });
        console.log();
        if (dataSource.isInitialized) await dataSource.destroy();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished generate migration'));
        if (args.run) {
            console.log();
            await MigrationRunHandler(configure, { connection: args.connection } as any);
        }
    } catch (error) {
        panic({ spinner, message: 'Generate migration failed!', error });
    }
};
