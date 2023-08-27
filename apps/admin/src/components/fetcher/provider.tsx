import { AxiosRequestConfig } from 'axios';
import { FC, ReactNode, useMemo } from 'react';
import { SWRConfig } from 'swr';

import { deepMerge } from '@/utils';

import { FetcherContext } from './constants';
import { useFetcher } from './hooks';

import { FetcherStore } from './store';
import { createRequest } from './utils';

/**
 * 分享响应式的axios实例
 * @param param0
 * @returns
 */
const FetcherProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { swr, ...config } = FetcherStore((state) => state);
    const fetcher = useMemo(() => createRequest(config), [config]);
    return <FetcherContext.Provider value={fetcher}>{children}</FetcherContext.Provider>;
};

/**
 * useSwr请求配置，使用swr需要包裹此组件
 * @param param0
 * @returns
 */
const SWRProvider: FC<{ children: ReactNode }> = ({ children }) => {
    /** swr配置项 */
    const swr = FetcherStore((state) => state.swr);
    const fetcher = useFetcher();
    const config = useMemo(
        () => ({
            ...swr,
            fetcher: async (
                resource: string | AxiosRequestConfig,
                options?: AxiosRequestConfig,
            ) => {
                let requestConfig: AxiosRequestConfig = options ?? {};
                if (typeof resource === 'string') requestConfig.url = resource;
                else requestConfig = deepMerge(requestConfig, resource, 'replace');
                // swr用于缓存get请求
                return fetcher.request({ ...requestConfig, method: 'get' });
            },
        }),
        [fetcher],
    );
    return <SWRConfig value={config}>{children}</SWRConfig>;
};

export const Fetcher: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <FetcherProvider>
            <SWRProvider>{children}</SWRProvider>
        </FetcherProvider>
    );
};
