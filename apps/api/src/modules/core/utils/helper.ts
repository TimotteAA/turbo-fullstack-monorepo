import { isNil } from 'lodash';

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
