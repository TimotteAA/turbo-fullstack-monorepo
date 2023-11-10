// apps/api/src/modules/database/types.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Ora } from 'ora';
import {
    DataSource,
    EntityManager,
    EntityTarget,
    FindTreeOptions,
    ObjectLiteral,
    ObjectType,
    SelectQueryBuilder,
} from 'typeorm';
import { Arguments } from 'yargs';

import { Configure } from '../config/configure';

import { SelectTrashMode } from './constants';
import { DataMock } from './resolver';

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

    /**
     * 填充类
     */
    seedRunner?: SeederConstructor;
    /**
     * 填充类列表
     */
    seeders?: SeederConstructor[];

    /**
     * 数据构建函数列表
     */
    mockMaps?: (() => DbMockOption<any, any>)[];
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

/** ****************************************数据填充Mocker*************************************** */

/**
 * Mock解析器
 */
export interface DbMock {
    <Entity>(
        entity: EntityTarget<Entity>,
    ): <Options>(options?: Options) => DataMock<Entity, Options>;
}

/**
 * 数据mock器解析后的元数据
 * E entity
 * O 模拟数据的interface
 */
export type DbMockOption<E, O> = {
    entity: ObjectType<E>;
    handler: DbMockHandler<E, O>;
};

/**
 * 各个entity的mock配置集合
 */
export type DbMockMaps = {
    [entityName: string]: DbMockOption<any, any>;
};

/**
 * 生成mock data的函数
 */
export type DbMockHandler<E, O> = (configure: Configure, options: O) => Promise<E>;

/**
 * Mock自定义参数覆盖，用于覆盖模拟entity的某些字段
 */
export type MockOverride<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};

/**
 * mock构造器
 */
export type DbMockBuilder = (
    Configure: Configure,
    dataSource: DataSource,
    factories: {
        [entityName: string]: DbMockOption<any, any>;
    },
) => DbMock;

/**
 * 定义一个Mock
 */
export type DefineMock = <E, O>(
    entity: ObjectType<E>,
    handler: DbMockHandler<E, O>,
) => () => DbMockOption<E, O>;

/** *****************************seeder*************************** */

/**
 * 数据填充命令参数
 */
export type SeederArguments = Arguments<TypeormOption & SeederOptions>;

/**
 * 数据填充handler参数
 */
export interface SeederOptions {
    connection?: string;
    transaction?: boolean;
    ignoreLock?: boolean;
}

/**
 * 数据填充类接口
 */
export interface SeederConstructor {
    new (spinner: Ora, args: SeederOptions): Seeder;
}

/**
 * 数据填充类对象
 */
export interface Seeder {
    load: (params: SeederLoadParams) => Promise<void>;
}

export interface SeederLoadParams {
    /**
     * 数据库连接名称
     */
    connection: string;
    /**
     * 数据库连接对象
     */
    dataSource: DataSource;

    /**
     * EntityManager实例
     */
    em: EntityManager;

    /**
     * 各个entity的mock解析器
     */
    mock?: DbMock;

    /**
     * mock函数列表
     */
    mocks?: DbMockMaps;

    /**
     * 全局配置实例
     */
    configure: Configure;

    /**
     * 是否忽略锁定
     */
    ignoreLock?: boolean;
}
