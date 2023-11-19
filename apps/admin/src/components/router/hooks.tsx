import { isNil } from 'lodash';
import { useCallback, useEffect } from 'react';
import { NavigateOptions, To, useNavigate } from 'react-router';

import { config } from '@/config';
import { deepMerge } from '@/utils';

import { createStoreHooks } from '../store';

import { useAuth } from '../auth/hooks';

import { getDefaultRouterConfig } from './_default.config';
import { RouterStore } from './store';
import { NavigateTo, RouteNavigator, RouteOption } from './types';
import { getAuthRoutes, getFlatRoutes, getFullPathRoutes, getMenus, getRoutes } from './utils';
import { AuthReDirect } from './views';

/**
 * 在应用启动前初始化路由模块
 * 如果没有登陆，则首先跳转到AuthRedirect组件，跳转到登录页
 */
export const useRouterSetuped = () => {
    const ready = RouterStore((state) => state.ready);

    /**
     * 用户是否登录
     */
    const auth = useAuth();
    // 根据用户登录处理路由表
    useEffect(() => {
        if (RouterStore.getState().config.auth?.enabled) {
            // 全局路由配置
            const { config: routerConfig } = RouterStore.getState();
            // 默认路由
            const { routes: defaultRoutes } = deepMerge(
                getDefaultRouterConfig(),
                config().router ?? {},
                'replace',
            );
            let routes = [...defaultRoutes];
            const routeIDs = routes.map(({ id }) => id);
            // 没有陪住登录页
            if (!routeIDs.find((id) => id === 'auth.login')) {
                routes.push({
                    id: 'auth.login',
                    auth: false,
                    menu: false,
                    path: routerConfig.auth?.path,
                    page: routerConfig.auth?.page,
                });
            }
            // 没有登陆
            if (isNil(auth)) {
                if (!routeIDs.find((id) => id === 'auth.redirect')) {
                    // 默认兜底页，匹配到首页
                    routes.push({
                        id: 'auth.redirect',
                        path: '*',
                        auth: false,
                        element: <AuthReDirect loginPath={routerConfig.auth?.path} />,
                    });
                }
            } else {
                // 滤除没有登录导航页
                routes = routes.filter((route) => route.id !== 'auth.redirect');
            }
            RouterStore.setState((state) => {
                state.config.routes = getAuthRoutes(routes, auth);
                state.ready = false;
            });
        }
    }, [auth]);

    useEffect(() => {
        if (!ready) {
            RouterStore.setState((state) => {
                const { routes } = state.config;
                state.menus = getMenus(getFullPathRoutes(routes));
                state.routes = getRoutes(routes);
                state.flat = getFlatRoutes(getFullPathRoutes(routes));
                state.ready = true;
            });
        }
    }, [ready]);
};

/**
 * 获取路由状态池的钩子
 */
export const useRouterStore = createStoreHooks(RouterStore);

export const useRoutesChange = () => {
    const addRoutes = useCallback(
        /** 添加路由 */
        <T extends RecordAnyOrNever>(items: RouteOption<T>[]) => {
            RouterStore.setState((state) => {
                state.config.routes = [...state.config.routes, ...items];
                state.ready = false;
            });
        },
        [],
    );
    const setRoutes = useCallback(
        /** 重置路由 */
        <T extends RecordAnyOrNever>(items: RouteOption<T>[]) => {
            RouterStore.setState((state) => {
                state.config.routes = [...items];
                state.ready = false;
            });
        },
        [],
    );
    return {
        addRoutes,
        setRoutes,
    };
};

/**
 * 对原生的useNavigate封装
 * 支持路径跳转，也支持跳到某个路由项中
 * @returns
 */
export const useNavigator = (): RouteNavigator => {
    // 扁平化的路由
    const flats = RouterStore(useCallback((state) => state.flat, []));
    const navigate = useNavigate();
    return useCallback(
        (to: NavigateTo, options?: NavigateOptions) => {
            let goTo: To | undefined;
            // 直接写死路径
            if (typeof to === 'string') goTo = to;
            // 元素的pathname跳转
            else if (to.pathname) {
                goTo = { ...to };
            } else {
                const route = flats.find((item) => item.id === to.id);
                if (route && route.path) goTo = { ...to, pathname: route.path };
            }
            if (goTo) navigate(goTo, options);
        },
        [flats, navigate],
    );
};
