// apps/api/src/modules/database/types.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FindTreeOptions, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Arguments } from 'yargs';

import { SelectTrashMode } from './constants';

/**
 * 查询的query hook
 */
export type QueryHook<Entity> = (
    qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 分页原数据
 */
export interface PaginateMeta {
    /**
     * 当前页项目数量
     */
    itemCount: number;
    /**
     * 项目总数量
     */
    totalItems?: number;
    /**
     * 每页显示数量
     */
    perPage: number;
    /**
     * 总页数
     */
    totalPages?: number;
    /**
     * 当前页数
     */
    currentPage: number;
}
/**
 * 分页选项
 */
export interface PaginateOptions {
    /**
     * 当前页数
     */
    page: number;
    /**
     * 每页显示数量
     */
    limit: number;
}

/**
 * 分页返回数据
 */
export interface PaginateReturn<E extends ObjectLiteral> {
    meta: PaginateMeta;
    items: E[];
}

/**
 * 排序方式
 */
export enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
}

/**
 * 排序类型,{字段名称: 排序方法}
 * 如果多个值则传入数组即可
 * 排序方法不设置,默认DESC
 */
export type OrderQueryType =
    | string
    | { name: string; order: `${OrderType}` }
    | Array<{ name: string; order: `${OrderType}` } | string>;

/**
 * 数据列表查询类型
 */
export interface QueryParams<E extends ObjectLiteral> {
    /** 处理额外的查询逻辑，通常是业务字段 */
    addQuery?: QueryHook<E>;
    /** 排序 */
    orderBy?: OrderQueryType;
    /** 查询包含软删除的数据 */
    withTrashed?: boolean;
    /** 仅查询软删除的数据 */
    onlyTrashed?: boolean;
}

/**
 * 服务类数据列表查询类型
 */
export type ServiceListQueryOption<E extends ObjectLiteral> =
    | ServiceListQueryOptionWithTrashed<E>
    | ServiceListQueryOptionNotWithTrashed<E>;

/**
 * 带有软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionWithTrashed<E extends ObjectLiteral> = Omit<
    FindTreeOptions & QueryParams<E>,
    'withTrashed'
> & {
    trashed?: `${SelectTrashMode}`;
} & Record<string, any>;

/**
 * 不带软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionNotWithTrashed<E extends ObjectLiteral> = Omit<
    ServiceListQueryOptionWithTrashed<E>,
    'trashed'
>;

/** ***********************************************************数据库连接相关配置************************************************* */

export type DbAdditionalConfig = {
    paths?: {
        /**
         * 迁移文件路径
         */
        migration?: string;
    };
};

/**
 * 自定义数据库配置
 */
export type DbConfig = {
    /**
     * 每个数据库公共的配置
     */
    common: Record<string, any> & DbAdditionalConfig;
    connections: Array<TypeOrmModuleOptions & { name?: string } & DbAdditionalConfig>;
};

/**
 * 最终数据库配置
 */
export type DbOptions = Record<string, any> & {
    common: Record<string, any>;
    connections: TypeormOption[];
};

/**
 * Typeorm连接配置
 */
export type TypeormOption = Omit<TypeOrmModuleOptions, 'name' | 'migrations'> & {
    name: string;
} & DbAdditionalConfig;

/** *********************************************************数据库迁移相关*********************************************************** */

/**
 * 基础数据库迁移命令选项
 */
export type BaseMigrationOptions = {
    /**
     * 数据库连接名称
     */
    connection: string;
};

/**
 * 创建空的迁移参数
 */
export type MigrationCreateOptions = {
    name: string;
};

export type MigrationCreateArguments = Arguments<BaseMigrationOptions & MigrationCreateOptions>;

/**
 * 生成迁移参数
 */
export type MigrationGenerateOptions = {
    /** 迁移文件名称 */
    name?: string;
    /** 美化sql */
    pretty?: boolean;
    /** 将生产的迁移文件内容打印到控制台 */
    dryrun?: boolean;
    /** 检查是否真的要运行 */
    check?: boolean;
    /** 在生成迁移后直接运行 */
    run?: boolean;
};

export type MigrationGenerateArguments = Arguments<BaseMigrationOptions & MigrationGenerateOptions>;

/**
 * 回滚迁移
 */
export interface MigrationRevertOptions {
    transaction?: string;
    fake?: boolean;
}

export type MigrationRevertArguments = Arguments<BaseMigrationOptions & MigrationRevertOptions>;

/**
 * 运行迁移
 */
export interface MigrationRunOptions extends MigrationRevertOptions {
    refresh?: boolean;
    onlydrop?: boolean;
    clear?: boolean;
    seed?: boolean;
}

export type MigrationRunArguments = Arguments<MigrationRunOptions & BaseMigrationOptions>;
