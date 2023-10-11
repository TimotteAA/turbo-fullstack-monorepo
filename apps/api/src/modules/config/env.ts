import { readFileSync } from 'fs';

import { parse } from 'dotenv';
import { isFunction, isNil } from 'lodash';

import { EnvironmentType } from './constants';

export class Env {
    /**
     * 读取配置文件的环境变量，与系统变量合并
     */
    async load() {
        // 如果没配置环境，默认为生产环境
        if (isNil(process.env.NODE_ENV)) process.env.NODE_ENV = EnvironmentType.PRODUCTION;

        // 引入esm的find-up
        const { findUpSync } = await import('find-up');

        // 默认查找.env文件
        const search = [findUpSync('.env')];
        // 如果是非生存环境，则查找对应的文件
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
            search.push(findUpSync([`.env.${process.env.NODE_ENV}`]));
        }

        // 过滤掉没找到的，也就是undefined的文件
        const envFiles = search.filter((file) => file !== undefined);
        // 合并所有的配置文件对象
        // .env.xxx会覆盖.env中的配置
        const fileEnvs = envFiles
            .map((filePath) => parse(readFileSync(filePath)))
            .reduce(
                (o, n) => ({
                    ...o,
                    ...n,
                }),
                {},
            );
        // 将配置文件中的设置与系统设置合并
        const envs = { ...process.env, ...fileEnvs };
        // 过滤出process.env中不存在的
        const keys = Object.keys(envs).filter((env) => !process.env[env]);
        // 然后设置到process.env上去
        for (const key of keys) {
            process.env[key] = envs[key];
        }
    }

    /**
     * 获取当前运行环境
     */
    run() {
        return process.env.NODE_ENV as EnvironmentType & RecordAny;
    }

    /**
     * 获取全部环境变量
     */
    get(): { [key: string]: string };

    /**
     * 获取某个环境变量
     */
    get<T extends BaseType = string>(key: string): T;

    /**
     * 获取某个环境变量，并做转换
     * @param key
     * @param parseTo
     */
    get<T extends BaseType = string>(key: string, parseTo: ParseType<T>): T;

    /**
     * 获取某个环境变量，如果process.env.NODE_ENV里没有，则返回传入的默认值
     * @param key
     * @param defaultValue
     */
    get<T extends BaseType = string>(key: string, defaultValue: T): T;

    /**
     * 获取类型转义后的环境变量,不存在则获取默认值
     * @param key
     * @param parseTo 类型转义函数
     * @param defaultValue 默认值
     */
    get<T extends BaseType = string>(key: string, parseTo: ParseType<T>, defaultValue: T): T;

    get<T extends BaseType = string>(key?: string, parseTo?: ParseType<T>, defaultValue?: T) {
        if (!key) return process.env as Record<string, string>;

        const val = process.env[key];
        if (val !== undefined) {
            if (parseTo && typeof parseTo === 'function') {
                return parseTo(val);
            }
            return val as T;
        }
        // process.env里没有
        // 毛都没传
        if (parseTo === undefined && defaultValue === undefined) {
            return undefined;
        }
        if (parseTo && defaultValue === undefined) {
            return isFunction(parseTo) ? undefined : parseTo;
        }

        return defaultValue! as T;
    }
}
