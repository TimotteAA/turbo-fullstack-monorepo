import { Type } from '@nestjs/common';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ClassTransformOptions } from 'class-transformer';

import { Configure } from '../config/configure';

/**
 * 所有的controller方法
 */
export type CrudMethod = 'list' | 'detail' | 'delete' | 'restore' | 'create' | 'update';

/**
 * 后台Crud装饰器入参
 */
export interface CrudMethodOption {
    /**
     * 路由是否允许匿名访问
     */
    allowGuest?: boolean;
    /**
     * 路由方法的序列化选项，noGroup不传参，否则根据'id'+方法匹配来传参
     */
    serialize?: ClassTransformOptions | 'noGroup';
    /**
     * 装饰器hook
     */
    hook?: (target: Type<any>, method: string) => void;
}

export interface CrudItem {
    /**
     * 启用的方法名
     */
    name: CrudMethod;
    /**
     * 方法选项
     */
    options?: CrudMethodOption;
}

/**
 * 后台CRUD装饰器入参
 */
export interface CrudOptions {
    /**
     * 用于序列化groups的前缀
     */
    id: string;
    /**
     * 启用的路由方法
     */
    enabled: Array<CrudMethod | CrudItem>;
    /**
     * 列表查询、创建、更新的Dto
     */
    dtos: {
        [key in 'query' | 'create' | 'update']?: any;
    };
}

/**
 * 装饰器配置工厂
 */
export type CrudOptionsRegister = (configure: Configure) => CrudOptions | Promise<CrudOptions>;

/** *********************************swagger配置相关********************************* */
/**
 * 一组endpoints的tag
 */
export interface TagOption {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
}

/**
 * 一个swagger文档配置，里面的配置会被各个版本所覆盖
 */
export interface ApiDocSource {
    title?: string;
    description?: string;
    /** 是否启用bearer鉴权 */
    auth?: boolean;
    tags?: (string | TagOption)[];
}

/**
 * 单个版本配置，或者说一个特定的swagger文档
 */
export interface VersionOption extends ApiDocSource {
    /** 单个版本的路由表 */
    routes?: RouteOption[];
}

export interface RouteOption {
    /** 某个路由的名称，由于是嵌套路由，所以有名称 */
    name: string;
    /** 路由前缀 */
    path: string;
    /** 所有的路由项 */
    controllers?: Type<any>[];
    /** 子路由 */
    children?: RouteOption[];
    /** 路由项的说明、标题 */
    doc?: ApiDocSource;
}

/** ****************************restful模块配置********************************* */
export interface ApiConfig extends ApiDocSource {
    /** 文档url前缀 */
    docuri?: string;
    /** 默认启用的swagger版本文档 */
    default: string;
    /** 所有启用的swagger版本 */
    enabled: string[];
    versions: Record<string, VersionOption>;
}

/** ********************************整合swagger和rest api********************************************* */
/**
 * swagger选项
 */
export interface SwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    /** 展平后的各个虚拟路由模块 */
    include: Type<any>[];
}

/**
 * API与swagger整合的选项，使用下面的配置整合不同的swagger文档
 */
export interface APIDocOption {
    default?: SwaggerOption;
    routes?: { [key: string]: SwaggerOption };
}
