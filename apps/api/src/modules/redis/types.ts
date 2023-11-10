import { RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * 单一redis连接配置
 */
export type RedisOption = IoRedisOptions & { name: string };

/**
 * redis模块配置
 */
export type RedisModuleConfig = RedisOption[];
