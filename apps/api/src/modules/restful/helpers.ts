import { Type } from '@nestjs/common';
import { RouteTree, Routes } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import { camelCase, isNil, omit, trim, upperFirst } from 'lodash';

import { Configure } from '../config/configure';
import { CreateModule } from '../core/helpers';

import { CONTROLLER_DEPENDS } from './constants';
import { RouteOption } from './types';

/**
 * 清理单个路由，确保最终的路由是/xxx、xxx的形式
 * @param routePath 原本的路由值
 * @param addPrefix 是否添加/
 */
export const trimPath = (routePath: string, addPrefix: boolean = true) =>
    `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;

/**
 * 清理一个路由表，处理每个路由项的path属性
 * @param routes
 */
export const getCleanRoutes = (routes: RouteOption[]) =>
    routes.map((route) => {
        // 先把children删了
        const item: RouteOption = {
            ...omit(route, ['children']),
            path: trimPath(route.path),
        };
        if (route.children && route.children.length > 0) {
            item.children = getCleanRoutes(item.children);
        } else {
            delete item.children;
        }
        return item;
    });

/**
 * 为路由树中的每一项生产最终的路由
 * @param routePath 路由项clean后的路由
 * @param prefix 前缀，可能来自父级路由、或者全局设置路由
 * @param version 版本号
 */
export const genRoutePath = (routePath: string, prefix?: string, version?: string) => {
    const addVersion = `${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`;
    return isNil(prefix) ? trimPath(addVersion) : trimPath(`${prefix}${addVersion}`);
};

export const createRouteModuleTree = (
    configure: Configure,
    modules: Record<string, Type<any>>,
    routes: RouteOption[],
    parentModule?: string,
): Promise<Routes> =>
    Promise.all(
        routes.map(async ({ name, path, children, controllers, doc }) => {
            // 平铺后的路由模块名称
            const moduleName = parentModule ? `${parentModule}.${name}` : name;
            // 在某一层中重复了
            if (Object.keys(moduleName).includes(moduleName)) {
                throw new Error(`route name should be unique in the same level!`);
            }
            // 获得所有控制器的依赖，先嵌套数组打平，再去重
            const depends = controllers
                .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
                .reduce((o: Type<any>[], n) => [...o, ...n], [])
                .reduce((o: Type<any>[], n: Type<any>) => {
                    if (o.find((i) => i === n)) return o;
                    return [...o, n];
                }, []);

            // 如果控制器使用@ApiTags装饰器，则使用route的tag配置
            if (doc?.tags && doc.tags.length > 0) {
                controllers.forEach((controller) => {
                    !Reflect.getMetadata('swagger/apiUseTags', controller) &&
                        ApiTags(
                            ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name)),
                        )(controller);
                });
            }

            // 创建路由模块，并导入依赖
            const module = CreateModule(`${upperFirst(camelCase(moduleName))}RouteModule`, () => ({
                controllers,
                imports: depends,
            }));
            // 添加所有的modules，防止重名
            modules[moduleName] = module;
            const route: RouteTree = { path, module };
            // 子路由递归处理
            if (children) {
                route.children = await createRouteModuleTree(
                    configure,
                    modules,
                    children,
                    moduleName,
                );
            }
            return route;
        }),
    );

/** ******************************下面是文档相关的************************************ */
/**
 * 生成最终的文档路径
 * @param routePath
 * @param prefix
 * @param version
 */
export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);
