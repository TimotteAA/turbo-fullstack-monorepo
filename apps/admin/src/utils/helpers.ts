import deepmerge from 'deepmerge';
import { isNil } from 'lodash';
import { MutableRefObject } from 'react';

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

export const isUrl = (path?: string) => {
    if (isNil(path) || !path.startsWith('http') || !path.startsWith('https')) return false;
    try {
        const url = new URL(path);
        return !!url;
    } catch (error) {
        return false;
    }
};

export const isAsyncFn = <A extends any[], R>(
    fn: (...args: A) => R | Promise<R>,
): fn is (...args: A) => Promise<R> => {
    const asyncFunc = async () => {};
    return fn instanceof asyncFunc.constructor.prototype === true;
};

/**
 * 防抖执行函数,在一段时间内只执行一次
 * @param ref 对比控制值
 * @param fn 执行的函数,可为异步
 * @param wait 间隔时间
 */
export const debounceRun = (
    ref: MutableRefObject<NodeJS.Timeout | undefined>,
    fn: (...args: any[]) => any,
    wait?: number,
) => {
    if (isNil(ref.current)) {
        clearTimeout(ref.current);
        ref.current = setTimeout(() => {
            if (isAsyncFn(fn)) {
                fn().then(() => {
                    ref.current = undefined;
                });
            } else {
                fn();
                ref.current = undefined;
            }
        }, wait ?? 10);
    }
};
