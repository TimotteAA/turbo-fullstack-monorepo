import { useCallback, useContext } from 'react';

import { FetcherContext } from './constants';
import { FetcherConfig } from './types';
import { createRequest } from './utils';

/**
 * 获取一个响应式的fetcher实例
 * @returns
 */
export const useFetcher = () => useContext(FetcherContext);

/**
 * 创建一个新的fetcher
 * 每次函数执行时内部的状态变量都会是最新值
 * @returns
 */
export function useFetcherCreater() {
    return useCallback((config?: FetcherConfig) => createRequest(config), []);
}
