import { join } from 'path';

import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { DbOptions, MigrationRevertArguments } from '../../types';

import { TypeormMigrationRevertRunner } from './migration-revert.runner';

export const MigrationRevertHandler = async (
    configure: Configure,
    args: MigrationRevertArguments,
) => {
    const spinner = ora('Start to revert migrations');
    // 连接名
    const cname = args.connection ?? 'default';
    let dataSource: DataSource | undefined;
    try {
        spinner.start();
        const { connections = [] } = await configure.get<DbOptions>('database');
        // cname对应的数据库配置
        const dbConfig = connections.find(({ name }) => name === cname);
        if (isNil(dbConfig))
            panic({ spinner, error: `Database connection named ${cname} not exists!` });
        console.log();
        const runner = new TypeormMigrationRevertRunner();
        // 初始数据库连接
        dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);
        dataSource.setOptions({
            subscribers: [],
            synchronize: false,
            migrationsRun: false,
            dropSchema: false,
            logging: ['error'],
            migrations: [
                join(dbConfig.paths.migration, '**/*.js'),
                join(dbConfig.paths.migration, '**/*.ts'),
            ],
        });
        await dataSource.initialize();
        console.log();
        await runner.handler({
            dataSource,
            transaction: args.connection,
            fake: args.fake,
        });
        await dataSource.destroy();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished revert migrations'));
    } catch (error) {
        if (dataSource && dataSource.isInitialized) await dataSource.destroy();
        panic({ spinner, message: 'Revert migrations failed!', error });
    }
};
