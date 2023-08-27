import { isNil } from 'lodash';
import { useCallback } from 'react';

import { useNavigator } from '../router/hooks';

import { KeepAliveStore } from './store';

import { KeepAliveAction } from '.';

/**
 * 获得active的page id
 * @returns
 */
export const useActived = () => KeepAliveStore(useCallback((state) => state.active, []));

export const useKeepAlives = () => KeepAliveStore(useCallback((state) => state.lives, []));

/**
 * 封装reducer actions，以供KeepAliveTabs使用
 */
export const useKeepAliveDispatch = () => {
    // 删除tab时使用
    const navigate = useNavigator();
    const removeAlive = useCallback(
        (id: string) => {
            KeepAliveStore.dispatch({
                type: KeepAliveAction.REMOVE,
                payload: {
                    id,
                    navigate,
                },
            });
        },
        [navigate],
    );

    const removeAlives = useCallback(
        (ids: string[]) => {
            KeepAliveStore.dispatch({
                type: KeepAliveAction.REMOVE_MULTI,
                payload: {
                    ids,
                    navigate,
                },
            });
        },
        [navigate],
    );

    const changeAlive = useCallback(
        (id: string) => {
            KeepAliveStore.dispatch({
                type: KeepAliveAction.CHANGE,
                payload: {
                    id,
                    navigate,
                },
            });
        },
        [navigate],
    );

    const clearAlives = useCallback(() => {
        KeepAliveStore.dispatch({
            type: KeepAliveAction.CLEAR,
            payload: {
                navigate,
            },
        });
    }, [navigate]);

    /**
     * 设定reset并刷新页面
     */
    const refreshAlive = useCallback(
        (id: string | null) => {
            KeepAliveStore.dispatch({
                type: KeepAliveAction.RESET,
                payload: { id },
            });
            if (!isNil(id) && navigate) navigate({ id });
        },
        [navigate],
    );

    return {
        refreshAlive,
        changeAlive,
        clearAlives,
        removeAlive,
        removeAlives,
    };
};
