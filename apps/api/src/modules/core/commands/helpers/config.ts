import { join, resolve } from 'path';
import { exit } from 'process';

import { Configuration as NestCLIConfig } from '@nestjs/cli/lib/configuration';
import { existsSync, readFileSync } from 'fs-extra';
import { get, isNil, omit } from 'lodash';
import { StartOptions } from 'pm2';
import ts from 'typescript';

import { Configure } from '@/modules/config/configure';
import { deepMerge } from '@/modules/config/utils';

import { CLIConfig, Pm2Option } from '../types';

import { AppConfig } from '../../types';
import { panic } from '../../utils';

/** 项目根目录 */
const cwdPath = resolve(__dirname, '../../../../..');

export const getCLIConfig = (
    tsConfigFile: string,
    nestConfigFile: string,
    tsEntryFile?: string,
): CLIConfig => {
    let tsConfig: ts.CompilerOptions = {};
    const tsConfigPath = join(cwdPath, tsConfigFile);

    if (!existsSync(tsConfigPath)) panic(`ts config file '${tsConfigPath}' not exists!`);
    try {
        const allTsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));
        tsConfig = get(allTsConfig, 'compilerOptions', {});
    } catch (error) {
        panic({ error });
    }
    let nestConfig: NestCLIConfig = {};
    const nestConfigPath = join(cwdPath, nestConfigFile);
    if (!existsSync(nestConfigPath)) panic(`nest cli config file '${nestConfigPath}' not exists!`);
    try {
        nestConfig = JSON.parse(readFileSync(nestConfigPath, 'utf-8'));
    } catch (error) {
        panic({ error });
    }
    const dist = get(tsConfig, 'outDir', 'dist');
    const src = get(nestConfig, 'sourceRoot', 'src');
    const paths = {
        cwd: cwdPath,
        dist,
        src,
        js: join(dist, nestConfig.entryFile ?? 'main.js'),
        ts: join(src, tsEntryFile ?? 'main.ts'),
        bun: './node_modules/bun/bin/bun',
        nest: './node_modules/@nestjs/cli/bin/nest.js',
    };

    return {
        options: {
            ts: tsConfig,
            nest: nestConfig,
        },
        paths,
        subprocess: {
            bun: {
                cwd: cwdPath,
                stdout: 'inherit',
                env: process.env,
                onExit: (process) => {
                    process.kill();
                    if (!isNil(process.exitCode)) exit(0);
                },
            },
            node: {
                cwd: cwdPath,
                env: process.env,
                stdio: 'inherit',
            },
        },
    };
};

/**
 * 合并pm2配置
 * @param configure
 * @param option
 * @param config
 * @param script
 */
export const getPm2Config = async (
    configure: Configure,
    option: Pm2Option,
    config: CLIConfig,
    script: string,
): Promise<StartOptions> => {
    const { name, pm2: customConfig = {} } = await configure.get<AppConfig>('app');
    const defaultConfig: StartOptions = {
        name,
        cwd: cwdPath,
        script,
        args: option.command,
        autorestart: true,
        watch: option.watch,
        ignore_watch: ['node_modules'],
        env: process.env,
        exec_mode: 'fork',
        interpreter: config.paths.bun,
    };
    return deepMerge(
        defaultConfig,
        omit(customConfig, ['name', 'cwd', 'script', 'args', 'watch', 'interpreter']),
        'replace',
    );
};
