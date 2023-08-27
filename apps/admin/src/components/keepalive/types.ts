import { RefObject } from 'react';

import { RouteNavigator } from '@/components/router/types';

import { KeepAliveAction } from './constants';

export interface KeepAliveConfig {
    /** 默认页 */
    path?: string;
    /** 当前活跃路由？ */
    active?: string | null;
    /** 路由黑名单 */
    exclude?: Array<string>;
    /** tabs上限 */
    maxLen?: number;
}

export interface KeepAliveStoreType extends Required<KeepAliveConfig> {
    /** 白名单? */
    include?: Array<string>;
    /** 保存的标签id数组 */
    lives: string[];
    reset: string | null;
    /** 是否准备完毕 */
    setuped: boolean;
}

/**
 * 每个页面地keepalive参数
 */
export interface AlivePageProps {
    /** 自己是否活跃 */
    isActive: boolean;
    /** 自己的id */
    id: string;
    /** 组件outlet保存的div? */
    renderDiv: RefObject<HTMLDivElement>;
}

export type KeepAliveActionType =
    | {
          type: KeepAliveAction.REMOVE;
          payload: {
              id: string;
              /** 删除后的跳转页 */
              navigate: RouteNavigator;
          };
      }
    | {
          type: KeepAliveAction.REMOVE_MULTI;
          payload: {
              ids: string[];
              navigate: RouteNavigator;
          };
      }
    | {
          type: KeepAliveAction.ADD;
          payload: {
              id: string;
          };
      }
    | {
          /** 切换成激活？ */
          type: KeepAliveAction.ACTIVE;
          payload: {
              id: string;
          };
      }
    | {
          type: KeepAliveAction.CHANGE;
          payload: {
              id: string;
              navigate: RouteNavigator;
          };
      }
    | {
          type: KeepAliveAction.CLEAR;
          payload: {
              navigate: RouteNavigator;
          };
      }
    | {
          /** 重置某个路由 */
          type: KeepAliveAction.RESET;
          payload: {
              id: string | null;
              //   navigate: RouteNavigator;
          };
      };
