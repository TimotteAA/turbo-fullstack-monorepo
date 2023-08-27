import { createContext, Dispatch } from 'react';

import { KeepAliveActionType } from './types';

/**
 * keepalive tabs的操作
 */
export enum KeepAliveAction {
    /**
     * 删除一个tab
     */
    REMOVE = 'remove',
    /**
     * 删除多个tab
     */
    REMOVE_MULTI = 'remove_multi',
    /**
     * 增加tab
     */
    ADD = 'add',
    /**
     * 清空
     */
    CLEAR = 'clear',
    ACTIVE = 'active',
    CHANGE = 'change',
    RESET = 'reset',
}

/**
 * 用于每个router记住自己在lives数组中的id
 */
export const KeepAliveIdContext = createContext<string | null>(null);
export const KeepAliveDispatchContext = createContext<Dispatch<KeepAliveActionType> | null>(null);
