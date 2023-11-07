import { CommandItem } from '@/modules/core/types';

import { MigrationGenerateArguments } from '../../types';

import { MigrationGenerateHandler } from './migration-generate.handler';

export const createMigrationGenerateComamnd: CommandItem<any, MigrationGenerateArguments> = async ({
    configure,
}) => {
    return {
        instant: true,
        command: ['db:migration:generage', 'dbmg'],
        describe: '自动创建一个含有更新数据schema sql语句的新的迁移文件',
        builder: {
            connection: {
                type: 'string',
                alias: 'c',
                describe: 'Connection name of typeorm to database.',
            },
            name: {
                type: 'string',
                alias: 'n',
                describe: 'Name of the migration class.',
            },
            run: {
                type: 'boolean',
                alias: 'r',
                describe: 'Run migration after generated',
                default: false,
            },
            dir: {
                type: 'string',
                alias: 'd',
                describe: 'The directory to save migration files',
            },
            pretty: {
                type: 'boolean',
                alias: 'p',
                describe: 'Pretty-print generated SQL',
                default: false,
            },
            dryrun: {
                type: 'boolean',
                alias: 'dr',
                describe:
                    'Prints out the contents of the migration instead of writing it to a file',
                default: false,
            },
            check: {
                type: 'boolean',
                alias: 'ch',
                describe:
                    'Verifies that the current database is up to date and that no migrations are needed. Otherwise exits with code 1.',
                default: false,
            },
        },

        handler: async (args: MigrationGenerateArguments) =>
            MigrationGenerateHandler(configure, args),
    };
};
