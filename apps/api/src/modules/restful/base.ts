import { Type } from '@nestjs/common';
import { Routes } from '@nestjs/core';
import { get, pick } from 'lodash';

import { Configure } from '../config/configure';

import { createRouteModuleTree, genRoutePath, getCleanRoutes } from './helpers';
import { ApiConfig, RouteOption } from './types';

/**
 * 用于生成路由的基础类
 */
export abstract class BaseRestful {
    constructor(protected configure: Configure) {}

    /**
     * API模块配置
     */
    protected config!: ApiConfig;

    /**
     * 路由表
     */
    protected _routes: Routes = [];

    /**
     * 默认的版本号
     */
    protected _default!: string;

    /**
     * 所有启用的api版本
     */
    protected _versions: string[] = [];

    /**
     * 最终创建出的RouteModule
     */
    protected _modules: { [key: string]: Type<any> } = {};

    get routes() {
        return this._routes;
    }

    get default() {
        return this._default;
    }

    get versions() {
        return this._versions;
    }

    get modules() {
        return this._modules;
    }

    getConfig<T>(key?: string, defaultValue?: T) {
        return key ? get(this.config, key, defaultValue) : this.config;
    }

    abstract create(_config: ApiConfig): void;

    /**
     * 创建配置
     * @param config
     */
    protected createConfig(config: ApiConfig) {
        if (!config.default) {
            throw new Error('default api version name should been config!');
        }
        const versionMaps = Object.entries(config.versions)
            // 过滤可用的版本
            .filter(([name]) => {
                if (config.default === name) return true;
                return config.enabled.includes(name);
            })
            // 合并版本配置与总配置
            .map(([name, version]) => [
                name,
                {
                    ...pick(config, ['title', 'description', 'auth']),
                    ...version,
                    tags: Array.from(new Set([...(config.tags ?? []), ...(version.tags ?? [])])),
                    // 版本的路由
                    routes: getCleanRoutes(version.routes ?? []),
                },
            ]);

        config.versions = Object.fromEntries(versionMaps);
        // 设置所有版本号
        this._versions = Object.keys(config.versions);
        // 设置默认版本号
        this._default = config.default;
        // 启用的版本中必须包含默认版本
        if (!this._versions.includes(this._default)) {
            throw new Error(
                `Default api version named ${this.default} is not included in all versions`,
            );
        }
        this.config = config;
    }

    /**
     * 获取一个路由列表下的所有虚拟路由模块
     * @param routes
     * @param parent
     */
    protected getRouteModules(routes: RouteOption[], parent?: string) {
        const result = routes
            .map(({ name, children }) => {
                const routeName = parent ? `${parent}.${name}` : name;
                let modules: Type<any>[] = [this.modules[routeName]];
                if (children) modules = [...modules, ...this.getRouteModules(children, routeName)];
                return modules;
            })
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        return result;
    }

    /**
     * 构建每个版本的路由树
     */
    protected async createRoutes() {
        const prefix = await this.configure.get<string>('app.prefix');
        const versionMaps = Object.entries(this.config.versions);

        // 对每个版本的路由进行处理
        // 先根据路由表创建所有的虚拟路由模块，然后添加前缀、版本
        this._routes = (
            await Promise.all(
                versionMaps.map(async ([name, version]) =>
                    (
                        await createRouteModuleTree(
                            this.configure,
                            this._modules,
                            version.routes ?? [],
                            name,
                        )
                    ).map((route) => ({
                        ...route,
                        path: genRoutePath(route.path, prefix, name),
                    })),
                ),
            )
        ).reduce((o, n) => [...o, ...n], []);
        // 生成一个默认的，不带版本号的路由
        const defaultVersion = this.config.versions[this.default];
        this._routes = [
            ...this._routes,
            ...(
                await createRouteModuleTree(
                    this.configure,
                    this._modules,
                    defaultVersion.routes ?? [],
                )
            ).map((route) => ({
                ...route,
                path: genRoutePath(route.path, prefix),
            })),
        ];
    }
}
