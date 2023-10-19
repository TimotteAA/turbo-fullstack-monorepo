import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import * as configs from './config';
import { ContentModule } from './modules/content/content.module';
import { App, CreateOptions } from './modules/core/types';
import { DatabaseModule } from './modules/database/database.module';
import { MeiliSearchModule } from './modules/meilisearch/meilisearch.module';
import { echoApi } from './modules/restful/helpers';
import { RestfulModule } from './modules/restful/restful.module';

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
    ],
    globals: {},
    builder: async ({ BootModule }) => {
        const container = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        // if (!isNil(await configure.get('api', null))) {
        //     // 构建文档
        //     const restful = container.get(Restful);
        //     await restful.factoryDocs(container);
        // }
        return container;
    },
};

export const listened: (app: App, startTime: Date) => () => Promise<void> =
    ({ configure, container }, startTime) =>
    async () => {
        const { default: chalk } = await import('chalk');
        console.log();
        await echoApi(configure, container);
        console.log('used time:', chalk.cyan(`${new Date().getTime() - startTime.getTime()}`));
    };
