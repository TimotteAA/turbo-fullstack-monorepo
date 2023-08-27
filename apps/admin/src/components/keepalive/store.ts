import { produce } from 'immer';

import { filter, findIndex } from 'lodash';
import { Reducer } from 'react';

import { createReduxStore } from '../store';

import { KeepAliveAction } from './constants';

import { KeepAliveActionType, KeepAliveStoreType } from './types';

const keepAliveReducer: Reducer<KeepAliveStoreType, KeepAliveActionType> = produce(
    (state, action) => {
        switch (action.type) {
            /** 新打开标签页 */
            case KeepAliveAction.ADD: {
                // 已有的tabs
                const lives = [...state.lives];
                // 如果lives数组中已经包含了新增的id，或者active的就是新增的，直接返回
                if (
                    lives.some(
                        (item) => item === action.payload.id && state.active === action.payload.id,
                    )
                )
                    return;

                // 是否是新增的，此处是否是重复判断？
                const isNew = !lives.filter((item) => item === action.payload.id).length;
                if (isNew) {
                    // 超过maxLen，干掉第一个
                    if (lives.length >= state.maxLen) state.lives.shift();
                    state.lives.push(action.payload.id);
                    state.active = action.payload.id;
                }
                break;
            }
            case KeepAliveAction.REMOVE: {
                const { id, navigate } = action.payload;

                // 判断删除的是否还存在
                const index = findIndex(state.lives, (item) => item === id);
                if (index === -1) return;
                const toRemove = state.lives[index];
                state.lives.splice(index, 1);
                // 删除的是当前所处的页面
                if (state.active === toRemove) {
                    // 没有tab了，导航到默认页
                    if (state.lives.length < 1) {
                        navigate(state.path);
                    } else {
                        // 如果还有其他tab，设置新的活动tab为删除的tab前一个（如果有的话），否则设为删除的tab后一个
                        const toActiveIndex = index > 0 ? index - 1 : index;
                        state.active = state.lives[toActiveIndex];
                        navigate({ id: state.active });
                    }
                }
                break;
            }
            case KeepAliveAction.REMOVE_MULTI: {
                const { ids, navigate } = action.payload;
                state.lives = filter(state.lives, (item) => !ids.includes(item));
                if (state.lives.length < 1) navigate(state.path);
                break;
            }
            case KeepAliveAction.CLEAR: {
                state.lives = [];
                action.payload.navigate(state.path);
                break;
            }
            /** 标记某个tab为打开，但无路由切换，进行预加载 */
            case KeepAliveAction.ACTIVE: {
                const current = state.lives.find((item) => item === action.payload.id);
                if (current && state.active !== current) state.active = current;
                break;
            }
            /** change比active多了路有跳转 */
            case KeepAliveAction.CHANGE: {
                const { id, navigate } = action.payload;
                const current = state.lives.find((item) => item === id);
                if (!current || state.active === id) return;
                navigate({ id });
                break;
            }
            case KeepAliveAction.RESET: {
                const { id } = action.payload;
                state.reset = id;
                break;
            }
            default:
                break;
        }
    },
);

export const KeepAliveStore = createReduxStore(keepAliveReducer, {
    path: '/',
    active: null,
    include: [],
    exclude: [],
    maxLen: 10,
    lives: [],
    reset: null,
    setuped: false,
});
