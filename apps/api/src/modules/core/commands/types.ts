import { SpawnOptions as NodeSpawnOptions } from 'child_process';

import { Configuration as NestCLIConfig } from '@nestjs/cli/lib/configuration';
import type { SpawnOptions as BunSpawnOptions } from 'bun';
import ts from 'typescript';

export type BuildCommandArguments = Pick<StartCommandArguments, 'tsConfig' | 'nestConfig'> & {
    watch?: string;
    preserveWatchOutput?: boolean;
};

export type Pm2Option = Pick<StartCommandArguments, 'typescript' | 'watch'> & {
    command: string;
};

/**
 * CLI配置
 */
export interface CLIConfig {
    options: {
        ts: ts.CompilerOptions;
        nest: NestCLIConfig;
    };
    // bun和nest分别是用bun和nestjs执行程序的bin文件
    // js、ts是执行入口js、ts文件
    paths: Record<'cwd' | 'dist' | 'src' | 'js' | 'ts' | 'bun' | 'nest', string>;
    /** 子进程设定 */
    subprocess: {
        bun: BunSpawnOptions.OptionsObject;
        node: NodeSpawnOptions;
    };
}

/**
 * 启动命令入参
 */
export type StartCommandArguments = {
    /**
     * nest-cli.json的文件路径(相对于当前cli运行目录)
     */
    nestConfig?: string;
    /**
     * 用于编译和运行的tsconfig.build.json的文件路径(相对于当前cli运行目录)
     */
    tsConfig?: string;
    /**
     * 使用直接运行TS文件的入口文件,默认为main.ts
     * 如果是运行js文件,则通过nest-cli.json的entryFile指定
     */
    entry?: string;

    /**
     * 是否使用PM2后台静默启动生产环境
     */
    prod?: boolean;

    /**
     * 是否在生成环境下直接运行ts命令
     */
    typescript?: boolean;

    /**
     * 是否监控,所有环境都可以使用(但在非PM2启动的生产环境下此选项无效)
     */
    watch?: boolean;

    /**
     * 是否开启debug模式,只对非生产环境有效
     */
    debug?: boolean | string;

    /**
     * 是否重启应用(PM2进程)
     */
    restart?: boolean;
};
