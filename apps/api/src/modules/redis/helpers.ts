import { ConfigureRegister, ConfigureFactory } from '@/modules/config/types';

import { createConnectionOptions } from '../config/helpers';

import { RedisModuleConfig } from './types';

/**
 * 创建redis模块配置
 * 自定义时传入原生配置，但是最终加工成RedisConfig类型
 * @param register
 */
export const createRedisConfig: (
    register: ConfigureRegister<RedisModuleConfig>,
) => ConfigureFactory<RedisModuleConfig> = (register) => ({
    register,
    hook: (_configure, value) => createConnectionOptions(value),
    defaultRegister: (configure) => [
        {
            name: 'default',
            connectOptions: {
                port: configure.env.get('REDIS_PORT', 6379),
                host: configure.env.get('REDIS_HOST', '127.0.0.1'),
            },
        },
    ],
});
