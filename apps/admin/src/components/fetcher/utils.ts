import axios from 'axios';
import type { AxiosRequestConfig, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { enableMapSet, produce } from 'immer';
import { isNil, omit } from 'lodash';

import { deepMerge } from '@/utils';

import { FetcherStore } from './store';
import { FetcherConfig, FetchOption } from './types';

enableMapSet();
const customOptions: Array<keyof FetchOption> = ['token', 'interceptors', 'cancel_repeat'];

/**
 * 创建axios实例
 * @param config Axios配置
 */
export const createRequest: (config?: Omit<FetcherConfig, 'swr'>) => AxiosInstance = (config) => {
    // 将全局配置和自定义配置合并
    const configed: FetcherConfig = deepMerge(FetcherStore.getState(), config ?? {}, 'replace');

    // 保存重复请求的cancel token
    let pendingMap = new Map();
    console.log('test ', omit(configed, customOptions));
    const instance = axios.create(omit(configed, customOptions));
    if (configed.interceptors?.request) {
        configed.interceptors.request(instance.interceptors.request);
    } else {
        instance.interceptors.request.use(
            (params) => {
                // 清理重复请求
                pendingMap = removePending(params, pendingMap);
                // 配置了进行重复请求，则加入pendingMap
                if (configed.cancel_repeat) pendingMap = addPending(params, pendingMap);
                // 添加token到header
                if (configed.token && typeof window !== 'undefined') {
                    params.headers.set('Authorization', configed.token);
                }
                return params;
            },
            (error) => {
                if (import.meta.env.DEV) console.error(error);
                return Promise.reject(error);
            },
        );
    }
    if (configed.interceptors?.response) {
        configed.interceptors.response(instance.interceptors.response);
    } else {
        instance.interceptors.response.use(
            async (response) => {
                const resToken = response.headers.authorization;
                // 如果返回token并且和保存的不一样，则刷新token
                if (resToken && configed.token !== resToken) {
                    FetcherStore.setState((state) => {
                        state.token = resToken;
                    });
                }
                // 删除pendingMap中的记录
                pendingMap = removePending(response.config, pendingMap);
                return response;
            },
            async (error) => {
                pendingMap = error.config && removePending(error.config, pendingMap);
                if (import.meta.env.DEV) console.error(error);
                if (!isNil(error.response)) {
                    switch (error.response.status) {
                        case 401: {
                            FetcherStore.setState((state) => {
                                state.token = null;
                            });
                            break;
                        }
                        default:
                            break;
                    }
                }
                return Promise.reject(error);
            },
        );
    }
    return instance;
};

/**
 * 生成重复请求控制对象的key
 * @param config axios请求配置对象
 * @returns
 */
function getPendingKey(config: AxiosRequestConfig): string {
    const { url, method, params } = config;
    let { data } = config;
    if (typeof data === 'string') data = JSON.parse(data);
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
}

/**
 * 添加一对重复请求取消函数的key-函数映射
 * @param config axios请求配置
 * @param maps 映射对象
 */
const addPending = (config: InternalAxiosRequestConfig, maps: Map<string, AbortController>) =>
    produce(maps, (state) => {
        const pendingKey = getPendingKey(config);
        const controller = new AbortController();
        if (!config.signal) config.signal = controller.signal;
        if (!state.has(pendingKey)) state.set(pendingKey, controller);
        return state;
    });

/**
 * 删除一对重复请求取消函数的key-函数映射
 * @param config axios请求配置
 * @param maps 映射对象
 */
const removePending = (config: InternalAxiosRequestConfig, maps: Map<string, AbortController>) =>
    produce(maps, (state) => {
        const pendingKey = getPendingKey(config);
        const controller = state.get(pendingKey);
        if (!isNil(controller)) {
            controller.abort();
            state.delete(pendingKey);
        }
        return state;
    });
