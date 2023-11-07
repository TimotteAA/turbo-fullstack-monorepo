import { CommandItem } from '@/modules/core/types';

import { MigrationCreateArguments } from '../../types';

import { MigrationCreateHandler } from './migration-create.handler';

export const createMigrationCreateCommand: CommandItem<any, MigrationCreateArguments> = async (
    app,
) => {
    return {
        command: ['db:migration:create', 'dbmc'],
        describe: '创建一个新的空白的数据库迁移文件',
        builder: {
            connection: {
                type: 'string',
                alias: 'c',
                describe: '创建迁移的数据库连接名称',
            },
            name: {
                type: 'string',
                alias: 'n',
                describe: '迁移类的名称',
                demandOption: true,
            },
        },
        handler: async (args) => MigrationCreateHandler(app.configure, args),
    };
};
