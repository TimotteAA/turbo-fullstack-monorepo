import * as fakerjs from '@faker-js/faker';
import chalk from 'chalk';
import { isNil } from 'lodash';

import { Configure } from '@/modules/config/configure';

import { AppConfig, PanicOption } from '../types';

/**
 * 类似于lodash中的toNumber
 * @param value
 */
export function toBoolean(value?: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    if (isNil(value)) return false;
    // string
    try {
        const res = JSON.parse(value);
        return res;
    } catch (err) {
        return false;
    }
}

/**
 * 用于请求验证中转义null
 * @param value
 */
export function toNull(value?: string | null): string | null | undefined {
    return value === 'null' ? null : value;
}

/**
 * 输出命令行错误消息
 * @param option
 */
export async function panic(option: PanicOption | string) {
    // const chalk = (await import('chalk')).default;
    console.log();
    if (typeof option === 'string') {
        console.log(chalk.red(`\n❌ ${option}`));
        process.exit(1);
    }
    const { error, message, exit = true, spinner } = option;
    !isNil(error) ? console.log(chalk.red(error)) : console.log(chalk.red(`\n❌ ${message}`));
    if (!isNil(spinner)) spinner.fail(message);
    if (exit) process.exit(1);
}

export const getRandomCharString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const getFakerLocales = async (configure: Configure) => {
    const app = await configure.get<AppConfig>('app');
    const locales: fakerjs.LocaleDefinition[] = [];
    const locale = app.locale as keyof typeof fakerjs;
    const fallbackLocale = app.fallbackLocale as keyof typeof fakerjs;
    if (!isNil(fakerjs[locale])) locales.push(fakerjs[locale] as fakerjs.LocaleDefinition);
    if (!isNil(fakerjs[fallbackLocale]))
        locales.push(fakerjs[fallbackLocale] as fakerjs.LocaleDefinition);
    return locales;
};

export const getRandomListData = <T>(numItems: number, arr: T[]) => {
    if (numItems < 1) return [] as T[];
    if (numItems === 1) {
        return arr[Math.floor(Math.random() * arr.length)] as T;
    }
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numItems, arr.length)) as T[];
};
