import { ConfigureRegister, ConfigureFactory } from '@/modules/config/types';

import type { RedisOption } from './types';

/**
 * 创建redis模块配置
 * 自定义时传入原生配置，但是最终加工成RedisConfig类型
 * @param register
 */
export const createRedisConfig: (
    register: ConfigureRegister<RedisOption>,
) => ConfigureFactory<RedisOption> = (register) => ({
    register,
    // hook: (_configure, value) => createConnectionOptions(value),
    // defaultRegister: (_configure) => ({
    //     connections: [
    //         {
    //             name: 'default',
    //             host: 'localhost',
    //             port: 6380,
    //         },
    //     ],
    // }),
    defaultRegister: (_configure) => ({
        default: {
            host: 'localhost',
            port: 6380,
        },
    }),
});
