import { isNil, omit, trim } from 'lodash';
import { ComponentType, Suspense } from 'react';

import { DataRouteObject, redirect } from 'react-router';

import { isUrl } from '@/utils';

import { IAuth } from '../auth/types';

import { RouterStore } from './store';
import { RouteOption, RouterConfig } from './types';

import { getAsyncImport } from './views';

/**
 * 根据权限过滤路由表
 * @param routes 路由表
 * @param auth 权限
 * @returns
 */
export const getAuthRoutes = (
    routes: RouteOption[],
    auth: IAuth | null,
    configAuth?: { enabled?: boolean; path?: string; page?: string | ComponentType },
): RouteOption[] =>
    routes
        .map((route) => {
            if (route.auth !== false && route.auth?.enabled !== false) {
                if (isNil(auth)) return [];
                if (typeof route.auth !== 'boolean' && route.auth?.permissions?.length) {
                    if (!route.auth.permissions.every((p) => auth.permissions.includes(p))) {
                        if (configAuth?.enabled && !isNil(configAuth.path)) {
                            return [
                                { ...route, loader: () => redirect(configAuth.path as string) },
                            ];
                        }
                        return [];
                    }
                    if (!route.children?.length) return [route];
                    return [{ ...route, children: getAuthRoutes(route.children, auth) }];
                }
            }
            return [route];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获得路由表
 * @param routes
 * @returns
 */
export const getRoutes = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((route) => {
            // 路由分割线
            if (route.divide) return [];
            // 非首页、过滤外链
            if ((!route.index && isNil(route.path)) || isUrl(route.path)) {
                return route.children?.length ? getRoutes(route.children) : [];
            }
            return [route];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获得所有的菜单项
 * @param routes
 * @returns
 */
export const getMenus = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((route) => {
            if (!isNil(route.menu) && !route.menu) {
                return route.children?.length ? getMenus(route.children) : [];
            }
            return [
                {
                    ...route,
                    children: route.children?.length ? getMenus(route.children) : undefined,
                },
            ];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获得扁平化的路由表
 * @param routes
 * @returns
 */
export const getFlatRoutes = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((route) => {
            if (route.divide) return [];
            return route.children?.length ? [route, ...getFlatRoutes(route.children)] : [route];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获取带全路径的路由
 * @param routes 原始路由数组
 * @param parentPath 父级路径，用于递归调用
 */
export const getFullPathRoutes = (routes: RouteOption[], parentPath?: string): RouteOption[] =>
    routes
        .map((route) => {
            // 如果当前路由被标记为 devide，则跳过处理，返回空数组
            if (route.divide) return [];

            // 深复制当前路由对象，为避免修改原对象
            const item: RouteOption = { ...route };

            // 初始化父路径和子路径前缀
            // parent和child一开始一样
            const pathPrefix: { parent?: string; child?: string } = {
                // parent是否为空，为空则处理成/，否则是 /xxx/
                parent: trim(parentPath ?? '', '/').length
                    ? `/${trim(parentPath ?? '', '/')}/`
                    : '/',
                child: trim(parentPath ?? '', '/').length ? `/${trim(parentPath ?? '', '/')}` : '/',
            };

            // 如果当前路由被标记为 devide 或 index，则剔除掉 children 和 path 属性，并返回
            if (route.divide || route.index) return [omit(route, ['children', 'path'])];

            // 判断路由路径是否是 URL，如果是，则直接赋值给 item.path
            if (isUrl(route.path)) {
                item.path = route.path;
            } else {
                // 如果不是 URL，拼接父路径和子路径生成全路径
                // 当route.path存在时和pathPrefix.parent拼接，不存在直接取child
                pathPrefix.child = route.path?.length
                    ? `${pathPrefix.parent}${trim(route.path, '/')}`
                    : pathPrefix.child;
                // 分组不显示路由
                item.path = route.onlyGroup ? undefined : pathPrefix.child;
            }

            // 添加父路径
            if (!isNil(pathPrefix.parent) && item.meta) {
                item.meta.parent = pathPrefix.parent;
            }

            // 处理子路由，递归调用当前函数
            item.children = route.children?.length
                ? getFullPathRoutes(route.children, pathPrefix.child)
                : undefined;

            // 如果当前路由被标记为 onlyGroup，并且没有子路由，则将其 children 属性设置为 []
            if (route.onlyGroup) item.children = item.children?.length ? item.children : [];

            // 返回处理过的路由对象
            return [item];
        })
        // 使用 reduce 将 map 返回的二维数组合并成一维数组
        .reduce((o, n) => [...o, ...n], []);

/**
 * 构建路由渲染列表
 * 递归地将路由表中的每一项和全局配置合并
 * @param routes
 */
export const factoryRoutes = (routes: RouteOption[]) =>
    routes.map((item) => {
        const config = RouterStore.getState();
        let option: DataRouteObject = generateAsyncPage(config, item);
        const { children } = option;
        option = generateAsyncPage(config, option);
        if (!isNil(children) && children.length) {
            option.children = factoryRoutes(children);
        }
        return option;
    });

/**
 * 获取异步路由页面
 * 将全局配置和route自己的配置合并
 * @param config 全局router配置
 * @param option 路由表中的某项配置
 */
const generateAsyncPage = (config: RouterConfig, option: RouteOption) => {
    const item = { ...omit(option, ['Component', 'ErrorBoundary']) } as DataRouteObject;
    let fallback: JSX.Element | undefined;
    // 全局的loading
    if (config.loading) fallback = <config.loading />;
    // 页面自己的loading
    if (option.loading) fallback = <option.loading />;
    if (typeof option.page === 'string') {
        // 导出页面的组件
        const AsyncPage = getAsyncImport({
            page: option.page as string,
        });
        if (!isNil(option.pageRender)) {
            // 页面自己的render
            item.Component = () => option.pageRender!(item, AsyncPage);
        } else {
            // 全局
            item.Component = ({ ...rest }) => (
                <Suspense fallback={fallback}>
                    <AsyncPage route={item} {...rest} />
                </Suspense>
            );
        }
    } else {
        // 直接是组件了
        item.Component = option.page;
    }
    if (typeof option.error === 'string') {
        // error页面
        const AsyncErrorPage = getAsyncImport({
            page: option.error as string,
        });
        if (!isNil(option.errorRender)) {
            item.ErrorBoundary = () => option.errorRender!(item, AsyncErrorPage);
        } else {
            // 使用全局error包装
            item.ErrorBoundary = ({ ...rest }) => (
                <Suspense fallback={fallback}>
                    <AsyncErrorPage route={item} {...rest} />
                </Suspense>
            );
        }
    } else {
        // Error是个组件
        item.ErrorBoundary = option.error;
    }
    return item as DataRouteObject;
};
