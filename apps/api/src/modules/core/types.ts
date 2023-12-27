import { ModuleMetadata, PipeTransform, Type } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Ora } from 'ora';
import { StartOptions } from 'pm2';
import type { CommandModule } from 'yargs';

import { Configure } from '../config/configure';
import { ConfigStorageOptions, ConfigureFactory } from '../config/types';

export interface CustomResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export type App = {
    /** 应用实例 */
    container?: NestFastifyApplication;
    /** 配置中心实例 */
    configure: Configure;
    /**
     * cli命令
     */
    commands: CommandModule<RecordAny, RecordAny>[];
};

/**
 * 创建应用的选项参数
 */
export interface CreateOptions {
    /**
     * 除了核心模块，其余模块的构造函数，返回值为需要导入的模块
     */
    imports: (configure: Configure) => Promise<Required<ModuleMetadata['imports']>>;
    /**
     * 应用构建器
     */
    builder: ContainerBuilder;
    /**
     * 全局配置
     */
    globals?: {
        /**
         * 全局管道,默认为AppPipe,设置为null则不添加
         * @param params
         */
        pipe?: (configure: Configure) => PipeTransform<any> | null;
        /**
         * 全局拦截器,默认为AppInterceptor,设置为null则不添加
         */
        interceptor?: Type<any> | null;
        /**
         * 全局过滤器,默认AppFilter,设置为null则不添加
         */
        filter?: Type<any> | null;
        // guard...
        /**
         * 全局api guard
         */
        guard?: Type<any> | null;
    };

    /**
     * 所有的命令
     */
    commands: () => CommandCollection;
    /**
     * 配置选项
     */
    config: {
        /**
         * 初始配置集
         */
        factories: Record<string, ConfigureFactory<Record<string, any>>>;
        /**
         * 配置服务的动态存储选项
         */
        storage: ConfigStorageOptions;
    };
}

/**
 * app构建器，通过Nest.create创建耽搁cpp
 * BootModule为总的启动模块
 */
export interface ContainerBuilder {
    (params: { configure: Configure; BootModule: Type<any> }): Promise<NestFastifyApplication>;
}

// src/modules/core/types.ts
/**
 * 应用配置
 */
export interface AppConfig {
    /**
     * app名称
     */
    name: string;
    /**
     * 主机地址,默认为127.0.0.1
     */
    host: string;
    /**
     * 监听端口,默认3100
     */
    port: number;
    /**
     * 是否开启https,默认false
     */
    https: boolean;
    /**
     * 时区,默认Asia/Shanghai
     */
    timezone: string;
    /**
     * 语言,默认zh-cn
     */
    locale: string;
    /**
     * 替补语言
     */
    fallbackLocale?: string;
    /**
     * 控制台打印的url,默认自动生成
     */
    url?: string;
    /**
     * 由url+api前缀生成的基础api url
     */
    prefix?: string;
    /**
     * 是否是启动命令
     */
    start?: boolean;

    /**
     * 自定义pm2配置，对其中部分配置进行了修改
     */
    pm2?: Omit<StartOptions, 'name' | 'cwd' | 'script' | 'args' | 'interpreter' | 'watch'>;
    limit: {
        interval: number;
        rate: number;
    };
    /**
     * 是否启用ws
     */
    websockets?: boolean;
}

/**
 * 控制台错误函数panic的选项参数
 */
export interface PanicOption {
    /**
     * 报错消息
     */
    message?: string;
    /**
     * 抛出的异常信息
     */
    error?: any;
    /**
     * 是否退出进程
     */
    exit?: boolean;
    /**
     * ora实例
     */
    spinner?: Ora;
}

/** **********************************************cli命令相关类型*********************************************** */

/**
 * 构造一个命令
 */
export type CommandItem<T = Record<string, any>, U = Record<string, any>> = (
    app: Required<App>,
) => Promise<CommandOption<T, U>>;

/**
 * 单个命令的设置项
 */
export interface CommandOption<T = RecordAny, U = RecordAny> extends CommandModule<T, U> {
    /** 是否为启动即退出的瞬时应用 */
    instant?: boolean;
}

/**
 * 所有的命令构造器，传入app实例，然后拿到一个command
 * yargs使用示例：
 * ```ts
 * import yargs, { CommandModule, Arguments } from 'yargs';
 *
 * interface MyArgs {
 *     file: string;
 *     verbose?: boolean;
 * }
 *
 * const processCommand: CommandModule<MyArgs> = {
 *     command: 'process <file>',
 *     describe: 'Process a file',
 *     builder: {
 *         verbose: {
 *             type: 'boolean',
 *             describe: 'Run in verbose mode',
 *             default: false,
 *         },
 *     },
 *     handler: (argv: Arguments<MyArgs>) => {
 *         if (argv.verbose) {
 *             console.log(`Processing file at path: ${argv.file}`);
 *         } else {
 *             console.log('Processing file...');
 *         }
 *     },
 * };
 *
 * yargs
 *     .command(processCommand)
 *     .help()
 *     .argv;
 * ```
 */
export type CommandCollection = CommandItem<any, any>[];
