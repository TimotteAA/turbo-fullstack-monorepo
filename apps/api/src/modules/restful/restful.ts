import { INestApplication, Type } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isNil, omit, trim } from 'lodash';

import { BaseRestful } from './base';
import { genDocPath } from './helpers';
import {
    APIDocOption,
    ApiConfig,
    ApiDocSource,
    RouteOption,
    SwaggerOption,
    VersionOption,
} from './types';

export class Restful extends BaseRestful {
    /**
     * 各个版本的文档集
     */
    protected _docs!: {
        [version: string]: APIDocOption;
    };

    get docs() {
        return this._docs;
    }

    /**
     * 排除已经添加的模块
     */
    protected excludeVersionModules: string[] = [];

    async create(config: ApiConfig): Promise<void> {
        this.createConfig(config);
        await this.createRoutes();
        this.createDocs();
    }

    /**
     * 创建文档配置
     */
    createDocs() {
        const versionMaps = Object.entries(this.config.versions);
        const vDocs = versionMaps.map(([name, version]) => [
            name,
            this.getDocOption(name, version),
        ]);
        this._docs = Object.fromEntries(vDocs);
        const defaultVersion = this.config.versions[this._default];
        // 为默认版本生成一个文档
        this._docs.default = this.getDocOption(this.default, defaultVersion, true);
    }

    getModuleImports() {
        return [RouterModule.register(this.routes), ...Object.values(this.modules)];
    }

    async factoryDocs<T extends INestApplication>(
        container: T,
        metadata?: () => Promise<Record<string, any>>,
    ) {
        // 所有的文档
        const docs = Object.values(this._docs)
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes)])
            .reduce((o, n) => [...n, ...o], [])
            .filter((i) => !!i);
        for (const voption of docs) {
            const { title, description, version, auth, include, tags } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) =>
                    typeof tag === 'string'
                        ? builder.addTag(tag)
                        : builder.addTag(tag.name, tag.description, tag.externalDocs),
                );
            }
            builder.setVersion(version);
            if (!isNil(metadata)) await SwaggerModule.loadPluginMetadata(metadata);
            const document = SwaggerModule.createDocument(container, builder.build(), {
                include: include.length > 0 ? include : [() => undefined as any],
                ignoreGlobalPrefix: true,
                deepScanRoutes: true,
            });
            SwaggerModule.setup(voption!.path, container, document);
        }
    }

    /**
     *
     * 根据版本的文档配置设置一个默认的文档配置
     * 获取版本的路由集的Swagger配置
     * 过滤掉已经添加到include的路由模块
     * 如果还有多余的模块或者在没有当路由没文档的情况下，把include添加到选项中
     * 返回文档的版本配置
     *
     * @param name
     * @param voption 版本配置，title、auth、description等部分会继承自总的配置
     * @param isDefault
     */
    protected getDocOption(name: string, voption: VersionOption, isDefault = false) {
        const docConfig: APIDocOption = {};
        // 默认文档配置，最顶层的
        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            auth: voption.auth ?? false,
            version: name,
            path: trim(`${this.config.docuri}${isDefault ? '' : `/${name}`}`, '/'),
        };
        // 获取路由文档
        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes ?? [])
            : this.getRouteDocs(defaultDoc, voption.routes ?? [], name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        // 虚拟模块
        const routeModules = isDefault
            ? this.getRouteModules(voption.routes ?? [])
            : this.getRouteModules(voption.routes ?? [], name);
        // 文档所依赖的模块
        const include = this.filterExcludedModules(routeModules);
        // 版本DOC中有依赖的路由模块或者版本DOC中没有路由DOC则添加版本默认DOC
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include };
        }
        return docConfig;
    }

    /**
     * 排除已经添加的模块
     * @param routeModules
     */
    protected filterExcludedModules(routeModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this.modules)) {
            if (excludeNames.includes(name)) excludeModules.push(module);
        }
        return routeModules.filter(
            (rmodule) => !excludeModules.find((emodule) => emodule === rmodule),
        );
    }

    /**
     * 生成某一路由文档
     * @param option 版本文档配置、或者父级路由文档配置
     * @param routes
     * @param parent
     */
    protected getRouteDocs(
        option: Omit<SwaggerOption, 'include'>,
        routes: RouteOption[],
        parent?: string,
    ): { [key: string]: SwaggerOption } {
        /**
         * 合并版本文档与路由文档配置
         * @param vDoc
         * @param route
         */
        const mergeDoc = (vDoc: Omit<SwaggerOption, 'include'>, route: RouteOption) => ({
            // 合并文档的title、description、auth配置
            ...vDoc,
            ...route.doc,
            tags: Array.from(new Set([...(vDoc.tags ?? []), ...(route.doc?.tags ?? [])])),
            path: genDocPath(route.path, this.config.docuri, parent),
            include: this.getRouteModules([route], parent),
        });
        let routeDocs: { [key: string]: SwaggerOption } = {};
        // 判断路由是否有除tags的其他属性
        const hasAdditional = (doc?: ApiDocSource) =>
            doc && Object.keys(omit(doc, 'tags')).length > 0;

        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;

            // 如果这个路由项有除doc以外的配置，添加到已添加模块中
            if (hasAdditional(doc) || parent) this.excludeVersionModules.push(moduleName);
            // 添加到routeDocs中
            if (hasAdditional(doc)) {
                routeDocs[moduleName.replace(`${option.version},`, '')] = mergeDoc(option, route);
            }

            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }
}
