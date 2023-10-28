import { RedisOptions as IoRedisOptions } from 'ioredis';

// /**
//  * 自定义Redis配置（原生配置对象）如果没有配置name，hook会进行添加
//  */
// export type RedisSimpleRegisterConfigOptions = IoRedisOptions | IoRedisOptions[];

// /**
//  * 最终Redis模块配置
//  */
// export type RedisConfig = RedisConnectionOption[]

// /**
//  * redis链接配置项
//  * name不是哨兵节点
//  * 此处用于表示某个redis实例
//  */
// export type RedisConnectionOption = Omit<IoRedisOptions, 'name'> & { name: string };
// // export type RedisConnection

/**
 * 单一redis连接配置
 */
export type RedisOption = {
    // redis连接名称
    name: string;
    // 具体的连接配置
    connectOptions?: IoRedisOptions;
};

/**
 * redis模块配置
 */
export type RedisModuleConfig = RedisOption[];
