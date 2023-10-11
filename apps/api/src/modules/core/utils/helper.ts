import { isNil } from 'lodash';

import { PanicOption } from '../types';

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
    const chalk = (await import('chalk')).default;
    console.log();
    if (typeof option === 'string') {
        console.log(chalk.red(`\n❌ ${option}`));
        process.exit(1);
    }
    const { error, message, exit = true } = option;
    !isNil(error) ? console.log(chalk.red(error)) : console.log(chalk.red(`\n❌ ${message}`));
    if (exit) process.exit(1);
}
