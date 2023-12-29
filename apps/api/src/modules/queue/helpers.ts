import { isNil, omit } from 'lodash';

import { ConfigureFactory, ConfigureRegister } from '../config/types';
import { RedisOption } from '../redis/types';

import { QueueConfig } from './types';

export const createQueueConfig: (
    register: ConfigureRegister<RePartial<QueueConfig>>,
) => ConfigureFactory<RePartial<QueueConfig>, RePartial<QueueConfig>> = (register) => ({
    register,
    hook: async (configure, value) =>
        createQueueOptions(value as QueueConfig, await configure.get<RedisOption[]>('redis')),
    defaultRegister: (configure) => [
        {
            redis: configure.env.get('QUEUE_REDIS_NAME', 'default'),
        },
    ],
});

export const createQueueOptions = async (
    options: QueueConfig,
    redisOptions: RedisOption[],
): Promise<QueueConfig | undefined> => {
    // 所有的redis名称
    const names = redisOptions.map(({ name }) => name);
    // 没有default的redis配置
    if (redisOptions.length <= 0 && !names.includes('default')) return undefined;

    for (const option of options) {
        const redisName = option.redis;
        // 根据队列配置的redis名称，找到redis配置数组中的配置
        const redis = redisOptions.find((r) => r.name === redisName);
        if (!isNil(redis)) {
            option.connection = omit(redis, ['name']);
        }
    }
    return options;
};
