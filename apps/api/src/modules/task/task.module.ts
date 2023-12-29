import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';
import { RedisModule } from '../redis/redis.module';

import { TASK_QUEUE } from './constants';
import * as entityMaps from './entities';
import * as queueMaps from './queues';
import * as repoMaps from './repositorys';
import * as serviceMaps from './services';

@Module({})
export class TaskModule {
    static async forRoot(configure: Configure): Promise<DynamicModule> {
        return {
            global: true,
            module: TaskModule,
            // 全局已注册了queue的配置
            imports: [
                BullModule.registerQueue({
                    name: TASK_QUEUE,
                    connection: { host: 'localhost', port: 6381 },
                }),
                DatabaseModule.forRepository(Object.values(repoMaps)),
                RedisModule,
                addEntities(configure, Object.values(entityMaps)),
            ],
            providers: [...Object.values(serviceMaps), ...Object.values(queueMaps)],

            exports: [serviceMaps.TaskService],
        };
    }
}
