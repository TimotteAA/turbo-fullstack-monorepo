import { isAsyncFunction } from 'util/types';

import { Type } from '@nestjs/common';
import { RouteTree, Routes } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApiTags } from '@nestjs/swagger';
import { camelCase, isFunction, isNil, omit, trim, upperFirst } from 'lodash';

import { Configure } from '../config/configure';
import { CreateModule } from '../core/helpers';

import { CONTROLLER_DEPENDS, CRUD_OPTIONS_REGISTER } from './constants';
import { crud } from './crud';
import { Restful } from './restful';
import { APIDocOption, RouteOption } from './types';

/**
 * 清理单个路由，确保最终的路由是/xxx、xxx的形式
 * @param routePath 原本的路由值
 * @param addPrefix 是否添加/
 */
export const trimPath = (routePath: string, addPrefix: boolean = true) =>
    `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;
/**
 * 遍历路由及其子孙路由以清理路径前缀
 * @param data
 */
export const getCleanRoutes = (data: RouteOption[]): RouteOption[] =>
    data.map((option) => {
        const route: RouteOption = {
            ...omit(option, 'children'),
            path: trimPath(option.path),
        };
        if (option.children && option.children.length > 0) {
            route.children = getCleanRoutes(option.children);
        } else {
            delete route.children;
        }
        return route;
    });

export const createRouteModuleTree = (
    configure: Configure,
    modules: { [key: string]: Type<any> },
    routes: RouteOption[],
    parentModule?: string,
): Promise<Routes> =>
    Promise.all(
        routes.map(async ({ name, path, children, controllers, doc }) => {
            // 自动创建路由模块的名称
            const moduleName = parentModule ? `${parentModule}.${name}` : name;
            // RouteModule的名称必须唯一
            if (Object.keys(modules).includes(moduleName)) {
                throw new Error('route name should be unique in same level!');
            }
            // 获取每个控制器的依赖模块
            const depends = controllers
                .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
                .reduce((o: Type<any>[], n) => [...o, ...n], [])
                .reduce((o: Type<any>[], n: Type<any>) => {
                    if (o.find((i) => i === n)) return o;
                    return [...o, n];
                }, []);

            for (const controller of controllers) {
                // 拿到每个咯有模块的配置工厂函数 Crud里的函数
                const crudRegister = Reflect.getMetadata(CRUD_OPTIONS_REGISTER, controller);
                if (!isNil(crudRegister) && isFunction(crudRegister)) {
                    const crudOptions = isAsyncFunction(crudRegister)
                        ? await crudRegister(configure)
                        : crudRegister(configure);
                    // 执行路由装饰器

                    await crud(controller, crudOptions);
                    // if (controller.name === "UserController") {

                    //     console.log("hook", crudOptions.hook, controller, name)
                    // }
                }
            }

            // 为每个没有自己添加`ApiTags`装饰器的控制器添加Tag
            if (doc?.tags && doc.tags.length > 0) {
                controllers.forEach((controller) => {
                    !Reflect.getMetadata('swagger/apiUseTags', controller) &&
                        ApiTags(
                            ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
                        )(controller);
                });
            }
            // 创建路由模块,并导入所有控制器的依赖模块
            const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
                controllers,
                imports: depends,
            }));
            // 在modules变量中追加创建的RouteModule,防止重名
            modules[moduleName] = module;
            const route: RouteTree = { path, module };
            // 如果有子路由则进一步处理
            if (children)
                route.children = await createRouteModuleTree(
                    configure,
                    modules,
                    children,
                    moduleName,
                );
            return route;
        }),
    );

/**
 * 生成最终路由路径(为路由路径添加自定义及版本前缀)
 * @param routePath
 * @param prefix
 * @param version
 */
export const genRoutePath = (routePath: string, prefix?: string, version?: string) => {
    const addVersion = `${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`;
    return isNil(prefix) ? trimPath(addVersion) : trimPath(`${prefix}${addVersion}`);
};
/** ******************************下面是文档相关的************************************ */
/**
 * 生成最终的文档路径
 * @param routePath
 * @param prefix
 * @param version
 */
export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);

/** *******************打印端口************* */
/**
 * 输出API和DOC地址
 * @param factory
 */
export async function echoApi(configure: Configure, container: NestFastifyApplication) {
    const appUrl = await configure.get<string>('app.url');
    const chalk = (await import('chalk')).default;
    // 设置应用的API前缀,如果没有则与appUrl相同
    const urlPrefix = await configure.get('app.prefix', undefined);
    const apiUrl = !isNil(urlPrefix)
        ? `${appUrl}${urlPrefix.length > 0 ? `/${urlPrefix}` : urlPrefix}`
        : appUrl;
    console.log(`- RestAPI: ${chalk.green.underline(apiUrl)}`);
    console.log('- RestDocs:');
    const factory = container.get(Restful);
    const { default: defaultDoc, ...docs } = factory.docs;
    await echoApiDocs('default', defaultDoc, appUrl);
    for (const [name, doc] of Object.entries(docs)) {
        console.log();
        echoApiDocs(name, doc, appUrl);
    }
}

/**
 * 输出一个版本的API和DOC地址
 * @param name
 * @param doc
 * @param appUrl
 */
async function echoApiDocs(name: string, doc: APIDocOption, appUrl: string) {
    const getDocPath = (dpath: string) => `${appUrl}/${dpath}`;
    const chalk = (await import('chalk')).default;
    if (!doc.routes && doc.default) {
        console.log(
            `    [${chalk.blue(name.toUpperCase())}]: ${chalk.green.underline(
                getDocPath(doc.default.path),
            )}`,
        );
        return;
    }
    console.log(`    [${chalk.blue(name.toUpperCase())}]:`);
    if (doc.default) {
        console.log(`      default: ${chalk.green.underline(getDocPath(doc.default.path))}`);
    }
    if (doc.routes) {
        Object.entries(doc.routes).forEach(([_routeName, rdocs]) => {
            console.log(
                `      <${chalk.yellowBright.bold(rdocs.title)}>: ${chalk.green.underline(
                    getDocPath(rdocs.path),
                )}`,
            );
        });
    }
}
