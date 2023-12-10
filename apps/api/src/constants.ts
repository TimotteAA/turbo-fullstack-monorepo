import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import chalk from 'chalk';
import { isNil } from 'lodash';

import * as configs from './config';
import { ContentModule } from './modules/content/content.module';
import { createBuildCommand, createStartCommand } from './modules/core/commands';
import { App, CreateOptions } from './modules/core/types';
import * as dbCommands from './modules/database/commands';
import { DatabaseModule } from './modules/database/database.module';
import { MeiliSearchModule } from './modules/meilisearch/meilisearch.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RedisModule } from './modules/redis/redis.module';
import { echoApi } from './modules/restful/helpers';
import { Restful } from './modules/restful/restful';
import { RestfulModule } from './modules/restful/restful.module';
import { JwtAuthGuard } from './modules/user/guards';
import { UserModule } from './modules/user/user.module';

export const WEBAPP = 'web';
export const createData: CreateOptions = {
    config: {
        // 配置集
        factories: configs as any,
        storage: { enabled: true },
    },
    imports: async (configure) => [
        RestfulModule.forRoot(configure),
        DatabaseModule.forRoot(configure),
        ContentModule.forRoot(configure),
        MeiliSearchModule.forRoot(configure),
        RbacModule.forRoot(configure),
        UserModule.forRoot(configure),
        RedisModule.forRoot(configure),
    ],
    globals: { guard: JwtAuthGuard },
    builder: async ({ configure, BootModule }) => {
        const container = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        if (!isNil(await configure.get('api', null))) {
            // 构建文档
            const restful = container.get(Restful);
            await restful.factoryDocs(container);
        }
        return container;
    },
    commands: () => [createStartCommand, createBuildCommand, ...Object.values(dbCommands)],
};

export const listened: (app: App, startTime: Date) => () => Promise<void> =
    ({ configure, container }, startTime) =>
    async () => {
        // const { default: chalk } = await import('chalk');
        console.log();
        await echoApi(configure, container);
        console.log('used time:', chalk.cyan(`${new Date().getTime() - startTime.getTime()}`));
    };
