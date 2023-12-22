import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/utils';

import { DbOptions, SeederOptions } from '../../types';

import { runSeeder } from './run-seeder';

export const SeederHandler = async (configure: Configure, args: SeederOptions) => {
    const { connections = [] }: DbOptions = await configure.get<DbOptions>('database');
    // 连接名称
    const cname = args.connection ?? 'default';
    const dbConfig = connections.find(({ name }) => name === cname);
    if (isNil(dbConfig)) throw new Error(`The database config of ${cname} does not exists!`);

    if (isNil(dbConfig)) panic(`Database connection named ${cname} not exists!`);
    const runner = dbConfig.seedRunner;
    const spinner = ora('Start run seeder');
    try {
        spinner.start();
        console.log();
        await runSeeder(runner, args, spinner, configure, dbConfig);
        spinner.succeed(`\n 👍 ${chalk.greenBright.underline(`Finished Seeding`)}`);
        process.exit(0);
    } catch (error) {
        panic({ spinner, message: `Run seeder failed`, error });
    }
};
