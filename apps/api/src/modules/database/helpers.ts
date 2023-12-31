import { resolve } from 'path';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { isNil } from 'lodash';
import { EntityManager, EntityTarget, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { Configure } from '../config/configure';
import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';
import { deepMerge } from '../config/utils';

import { BaseSeeder } from './base';
import { DataMock } from './resolver';
import {
    DbConfig,
    DbMockBuilder,
    DbOptions,
    DefineMock,
    OrderQueryType,
    PaginateOptions,
    PaginateReturn,
    TypeormOption,
} from './types';

/**
 * 分页函数
 * @param qb queryBuilder实例
 * @param options 分页选项
 */
export const paginate = async <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    options: PaginateOptions,
): Promise<PaginateReturn<E>> => {
    const limit = isNil(options.limit) || options.limit < 1 ? 1 : options.limit;
    const page = isNil(options.page) || options.page < 1 ? 1 : options.page;
    const start = page >= 1 ? page - 1 : 0;
    const totalItems = await qb.getCount();
    qb.take(limit).skip(start * limit);
    const items = await qb.getMany();
    const totalPages =
        totalItems % limit === 0
            ? Math.floor(totalItems / limit)
            : Math.floor(totalItems / limit) + 1;
    const remainder = totalItems % limit !== 0 ? totalItems % limit : limit;
    const itemCount = page < totalPages ? limit : remainder;
    return {
        items,
        meta: {
            totalItems,
            itemCount,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
    };
};

/**
 * 树形数据手动分页函数
 * @param options 分页选项
 * @param data 数据列表
 */
export function manualPaginate<E extends ObjectLiteral>(
    options: PaginateOptions,
    data: E[],
): PaginateReturn<E> {
    const { page, limit } = options;
    let items: E[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    return {
        meta: {
            itemCount,
            totalItems,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
        items,
    };
}

export const getQrderByQuery = <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy: OrderQueryType,
): SelectQueryBuilder<E> => {
    if (typeof orderBy === 'string') {
        return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    }
    if (Array.isArray(orderBy)) {
        let i = 0;

        for (const item of orderBy) {
            // 第一个orderBy
            if (i === 0) {
                typeof item === 'string'
                    ? qb.orderBy(`${alias}.${item}`, 'DESC')
                    : qb.orderBy(`${alias}.${item.name}`, `${item.order}`);
                i++;
            } else {
                typeof item === 'string'
                    ? qb.addOrderBy(`${alias}.${item}`, 'DESC')
                    : qb.addOrderBy(`${alias}.${item.name}`, `${item.order}`);
            }
        }
        return qb;
    }
    return qb.orderBy(`${alias}.${orderBy.name}`, `${orderBy.order}`);
};

/**
 * 数据库配置构造器创建
 * @param register
 */
export const createDbConfig: (
    register: ConfigureRegister<RePartial<DbConfig>>,
) => ConfigureFactory<DbConfig, DbOptions> = (register) => ({
    register,
    hook: (_configure, value) => createDbOptions(value),
    defaultRegister: () => ({
        common: {
            charset: 'utf8mb4',
            logging: ['error'],
            seedRunner: BaseSeeder,
            mockMaps: [],
            seeders: [],
        },
        connections: [],
    }),
});

/**
 * 创建数据库配置
 * @param options 自定义配置
 */
export const createDbOptions = (options: DbConfig) => {
    const newOptions: DbOptions = {
        common: deepMerge(
            {
                charset: 'utf8mb4',
                logging: ['error'],
                paths: {
                    migration: resolve(__dirname, '../../database/migrations'),
                },
            },
            options.common ?? {},
            'replace',
        ),
        connections: createConnectionOptions(options.connections ?? []),
    };
    newOptions.connections = newOptions.connections.map((connection) => {
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
            newOptions.common,
            {
                ...newOption,
                autoLoadEntities: true,
            } as any,
            'replace',
        ) as TypeormOption;
    });
    return newOptions;
};

export const addEntities = async (
    configure: Configure,
    entities: EntityClassOrSchema[] = [],
    name: string = 'default',
) => {
    const database = await configure.get<DbOptions>('database');
    if (isNil(database)) {
        throw new Error('数据库连接没有配置！');
    }
    const dbConfig = database.connections.find((connection) => connection.name === name);
    if (isNil(dbConfig)) throw new Error(`数据连接：${name}连接不存在`);

    const oldEntities = (dbConfig.entities ?? []) as EntityClassOrSchema[];

    /**
     * 更新数据库配置,添加上新的模型
     */
    configure.set(
        'database.connections',
        database.connections.map((connection) =>
            connection.name === name
                ? {
                      ...connection,
                      entities: [...entities, ...oldEntities],
                  }
                : connection,
        ),
    );
    return TypeOrmModule.forFeature(entities, name);
};

/** ***************************数据填充相关*********************************** */
/**
 * mock构建起
 * @param configure 全局配置
 * @param dataSource 数据源
 * @param mocks mock函数组
 */
export const mockBuilder: DbMockBuilder =
    (configure, dataSource, mocks) => (entity) => (settings) => {
        const name = entityName(entity);
        if (!mocks[name]) {
            throw new Error(`没有找到Entity ${name}的mock`);
        }
        return new DataMock(
            name,
            configure,
            entity,
            dataSource.createEntityManager(),
            mocks[name].handler,
            settings,
        );
    };

export const entityName = <T>(entity: EntityTarget<T>) => {
    if (entity instanceof Function) return entity.name;
    if (!isNil(entity)) return new (entity as any)().constructor.name;
    throw new Error('Entity is not defined');
};

/**
 * 定义一个mock
 * @param entity
 * @param handler
 */
export const defindMock: DefineMock = (entity, handler) => () => ({ entity, handler });

/**
 * 忽略外键
 * @param em EntityManager实例
 * @param type 数据库类型
 * @param disabled 是否禁用
 */
export async function resetForeignKey(
    em: EntityManager,
    type = 'mysql',
    disabled = true,
): Promise<EntityManager> {
    let key: string;
    let query: string;
    if (type === 'sqlite') {
        key = disabled ? 'OFF' : 'ON';
        query = `PRAGMA foreign_keys = ${key};`;
    } else {
        key = disabled ? '0' : '1';
        query = `SET FOREIGN_KEY_CHECKS = ${key};`;
    }
    await em.query(query);
    return em;
}
