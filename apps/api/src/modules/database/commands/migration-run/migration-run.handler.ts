import { join } from 'path';

import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { DbOptions, MigrationRunArguments } from '../../types';

import { TypeormMigrationRun } from './migration-run.runner';

export const MigrationRunHandler = async (configure: Configure, args: MigrationRunArguments) => {
    const spinner = ora('Start to run migrations');
    const cname = args.connection ?? 'default';
    let dataSource: DataSource | undefined;
    try {
        spinner.start();
        const { connections = [] } = await configure.get<DbOptions>('database');
        const dbConfig = connections.find(({ name }) => name === cname);
        if (isNil(dbConfig)) panic(`Database connection named ${cname} does not exist`);
        let dropSchema = false;
        dropSchema = args.refresh || args.onlydrop;
        console.log();
        const runner = new TypeormMigrationRun();
        dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);
        if (dataSource && dataSource.isInitialized) await dataSource.destroy();
        const options = {
            subscribers: [],
            synchronize: false,
            migrationsRun: false,
            dropSchema,
            logging: ['error'],
            migrations: [
                join(dbConfig.paths.migration, '**/*.ts'),
                join(dbConfig.paths.migration, '**/*.js'),
            ],
        } as any;
        if (dropSchema) {
            dataSource.setOptions(options);
            await dataSource.initialize();
            await dataSource.destroy();
            spinner.succeed(chalk.greenBright.underline('\n 👍 Finished drop database schema'));
            if (args.onlydrop) process.exit();
        }
        dataSource.setOptions({ ...options, dropSchema: false });
        await dataSource.initialize();
        console.log();
        await runner.handler({
            dataSource,
            transaction: args.transaction,
            fake: args.fake,
        });
        await dataSource.destroy();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished run migrations'));
    } catch (error) {
        if (dataSource && dataSource.isInitialized) await dataSource.destroy();
        panic({ spinner, message: 'Run migrations failed!', error });
    }
};
