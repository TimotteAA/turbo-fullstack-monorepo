import { RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * 单一redis连接配置
 */
export type RedisOption = {
    [name: string]: IoRedisOptions;
};

/**
 * redis模块配置
// //  */
// export interface RedisModuleConfig {
//     connections: RedisOption[];
// }
