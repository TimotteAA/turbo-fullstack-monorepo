import { CommandItem } from '@/modules/core/types';

import { MigrationRevertArguments } from '../../types';

import { MigrationRevertHandler } from './migration-revert.handler';

export const createMigrationRevertCommand: CommandItem<any, MigrationRevertArguments> = async ({
    configure,
}) => ({
    source: true,
    command: ['db:migration:revert', 'dbmv'],
    describe: '对上次执行的迁移进行回滚',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                'ndicates if transaction should be used or not for migration run/revert/reflash. Enabled by default.',
            default: 'default',
        },
        fake: {
            type: 'boolean',
            alias: 'f',
            describe:
                'Fakes running the migrations if table schema has already been changed manully or extenrnally',
        },
    },
    handler: async (args: MigrationRevertArguments) => MigrationRevertHandler(configure, args),
});
