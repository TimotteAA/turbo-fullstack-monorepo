import { Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

/**
 * 所有的controller方法
 */
export type CrudMethod = 'list' | 'detail' | 'delete' | 'restore' | 'create' | 'update';

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
 * CRUD装饰器入参
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
