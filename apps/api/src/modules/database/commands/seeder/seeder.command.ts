import { CommandItem } from '@/modules/core/types';

import { SeederArguments } from '../../types';

import { SeederHandler } from './seeder.handler';

export const createSeederCommand: CommandItem<any, SeederArguments> = async ({ configure }) => ({
    source: true,
    command: ['db:seeder:run', 'dbs'],
    builder: {
        connection: {
            type: 'string',
            description: 'The connection name of db',
        },
        transaction: {
            type: 'boolean',
            description: 'Whether or not to run all seeds in transaction',
            default: true,
        },
        clear: {
            type: 'boolean',
            alias: 'r',
            describe: 'Clear which tables will truncated specified by seeder class.',
            default: true,
        },
        ignoreLock: {
            type: 'boolean',
            alias: 'i',
            describe:
                'Ignore seed lock and reset all seeds, not do it in production（seed跑过一次了，还跑吗？）',
            default: false,
        },
    },
    handler: async (args) => SeederHandler(configure, args),
});
