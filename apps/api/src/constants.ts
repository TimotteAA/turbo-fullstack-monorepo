import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import * as configs from './config';
import { ContentModule } from './modules/content/content.module';
import { CreateOptions } from './modules/core/types';
import { DatabaseModule } from './modules/database/database.module';
import { MeiliSearchModule } from './modules/meilisearch/meilisearch.module';

export const WEBAPP = 'web';
export const createData: CreateOptions = {
    config: {
        // 配置集
        factories: configs as any,
        storage: { enabled: true },
    },
    imports: async (configure) => [
        ContentModule.forRoot(configure),
        DatabaseModule.forRoot(configure),
        MeiliSearchModule.forRoot(configure),
    ],
    globals: {},
    builder: async ({ configure: _configure, BootModule }) =>
        NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: ['error', 'warn'],
        }),
};
