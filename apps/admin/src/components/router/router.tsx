import { memo } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom';

import { shallow } from 'zustand/shallow';

import Auth from '../auth/provider';

import { useRouterSetuped, useRouterStore } from './hooks';
import { factoryRoutes } from './utils';

/**
 * 最终渲染的router
 * @returns
 */
const RouterWrapper: FC = () => {
    const { ready, basepath, hash, window, routes } = useRouterStore(
        (state) => ({ ready: state.ready, ...state.config }),
        shallow,
    );
    // 路由没处理好
    if (!ready || routes.length <= 0) return null;
    const router = hash
        ? createHashRouter(factoryRoutes(routes), { basename: basepath, window })
        : createBrowserRouter(factoryRoutes(routes), { basename: basepath, window });
    return <RouterProvider router={router} />;
};

/**
 * 再利用react-router创建路由前，先配置好路由
 * @returns
 */
const RouterComponent: FC = () => {
    /**
     * 配置路由
     * 用户的登录与退出会重置路由
     */
    useRouterSetuped();
    return <RouterWrapper />;
};

/**
 * 全局路由组件
 * @returns
 */
const Router: FC = () => {
    const isAuth = useRouterStore((state) => state.config.auth?.enabled);
    return isAuth ? (
        <Auth>
            <RouterComponent />
        </Auth>
    ) : (
        <RouterComponent />
    );
};

export default memo(Router);
