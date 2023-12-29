import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';
import { omit } from 'lodash';

import { Configure } from '../config/configure';

import type { QueueConfig } from './types';

@Module({})
export class QueueModule {
    static async forRoot(configure: Configure): Promise<DynamicModule> {
        const queues = await configure.get<QueueConfig>('queue');
        return {
            global: true,
            imports: queues.map((queue) => BullModule.forRoot(queue.redis, omit(queue, ['redis']))),
            module: QueueModule,
        };
    }
}
