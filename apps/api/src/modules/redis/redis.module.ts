import { Module, ModuleMetadata } from '@nestjs/common';
import { isNil } from 'lodash';

import { Configure } from '../config/configure';
import { panic } from '../core/utils';

import { RedisService } from './services';
import type { RedisOption } from './types';

@Module({})
export class RedisModule {
    static async forRoot(configure: Configure) {
        const redis = await configure.get<RedisOption[]>('redis');
        if (isNil(redis)) panic('redis模块没有配置！');

        const providers: ModuleMetadata['providers'] = [];
        providers.push({
            provide: RedisService,
            async useFactory() {
                const redisService = new RedisService(redis);
                await redisService.createClients();
                return redisService;
            },
        });

        const exports: ModuleMetadata['exports'] = [RedisService];

        return {
            module: RedisModule,
            global: true,
            providers,
            exports,
        };
    }
}
