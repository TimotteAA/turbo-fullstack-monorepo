import { FetcherConfig } from './types';

/**
 * 默认fetcher配置，包括axios和swr
 * @returns
 */
export const defaultFetcherConfig = (): FetcherConfig => ({
    baseURL: '/api/',
    timeout: 10000,
    interceptors: {},
    token: null,
    cancel_repeat: true,
    swr: {},
});
