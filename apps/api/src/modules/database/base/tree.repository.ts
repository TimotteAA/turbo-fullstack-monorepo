import { isNil, pick, unset } from 'lodash';
import {
    EntityManager,
    EntityTarget,
    FindOptionsUtils,
    FindTreeOptions,
    ObjectLiteral,
    QueryRunner,
    SelectQueryBuilder,
    TreeRepository,
    TreeRepositoryUtils,
} from 'typeorm';

import { TreeChildrenResolve } from '../constants';
import { getQrderByQuery } from '../helpers';
import { OrderQueryType, OrderType, QueryParams } from '../types';

export class BaseTreeRepository<E extends ObjectLiteral> extends TreeRepository<E> {
    /**
     * typeorm默认tree repo查询名
     */
    protected _alias: string = 'treeEntity';

    get alias() {
        return this._alias;
    }

    /**
     * 删除后子entity如何操作
     */
    protected _childrenResolve?: TreeChildrenResolve;

    /**
     * 返回子分类的等级
     */
    get childrenResolve() {
        return this._childrenResolve;
    }

    /**
     * 默认排序规则，可以通过每个方法的orderBy选项进行覆盖
     */
    protected orderBy?: string | { name: string; order: `${OrderType}` };

    /**
     * 自定义tree repo，需要模仿原生tree repo的注入
     * @param target
     * @param manager
     * @param queryRunner
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(target: EntityTarget<E>, manager: EntityManager, queryRunner?: QueryRunner) {
        super(target, manager, queryRunner);
    }

    /**
     * 构建基础查询器，默认查询parent
     * @param qb
     */
    buildBaseQB(qb?: SelectQueryBuilder<E>) {
        const queryBuilder = qb ?? this.createQueryBuilder(this.alias);
        return queryBuilder.leftJoinAndSelect(`${this.alias}.parent`, 'parent');
    }

    /**
     * 对查询器排序
     */
    addOrderByQuery(qb: SelectQueryBuilder<E>, orderBy?: OrderQueryType) {
        const order = orderBy ?? this.orderBy;
        return !isNil(order) ? getQrderByQuery(qb, this.alias, order) : qb;
    }

    /**
     * 查询顶级分类
     * @param options
     */
    async findRoots(options?: FindTreeOptions & QueryParams<E>) {
        const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;

        let qb = this.addOrderByQuery(this.buildBaseQB(), orderBy);
        qb.where(`${escapeAlias(this.alias)}.${escapeColumn(parentPropertyName)} IS NULL`);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
        qb = addQuery ? await addQuery(qb) : qb;
        if (withTrashed) {
            qb.withDeleted();
            // 处理软删除
            if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        }
        return qb.getMany();
    }

    /**
     * 查询树形分类
     * @param options
     */
    async findTrees(options?: FindTreeOptions & QueryParams<E>) {
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 构建后代查询器，支持自定义排序与额外查询
     * 源码中构建后代查询很复杂，必须调用super
     * @param closureTableAlias
     * @param entity
     * @param options
     * @returns
     */
    async createDtsQueryBuilder(
        closureTableAlias: string,
        entity: E,
        options: FindTreeOptions & QueryParams<E> = {},
    ) {
        const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        let qb = this.buildBaseQB(
            this.createDescendantsQueryBuilder(this.alias, closureTableAlias, entity),
        );
        // 额外查询
        qb = addQuery
            ? await addQuery(this.addOrderByQuery(qb, orderBy))
            : this.addOrderByQuery(qb, orderBy);
        // 软删除
        if (withTrashed) {
            qb.withDeleted();
            if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        }
        return qb;
    }

    /**
     * 构建祖先查询器，支持自定义排序与额外查询
     * 源码中构建祖先查询很复杂，必须调用suoer
     * @param closureTableAlias
     * @param entity
     * @param options
     * @returns
     */
    async createAtsQueryBuilder(
        closureTableAlias: string,
        entity: E,
        options: FindTreeOptions & QueryParams<E> = {},
    ) {
        const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        let qb = this.buildBaseQB(
            this.createDescendantsQueryBuilder(this.alias, closureTableAlias, entity),
        );
        qb = addQuery
            ? await addQuery(this.addOrderByQuery(qb, orderBy))
            : this.addOrderByQuery(qb, orderBy);
        if (withTrashed) {
            qb.withDeleted();
            if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        }
        return qb;
    }

    /**
     * 查询后代树
     * @param entity
     * @param options
     */
    async findDescendantsTree(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.buildBaseQB(
        //     this.createDescendantsQueryBuilder(this.alias, 'treeClosure', entity),
        // );
        // // 额外查询
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // // 软删除
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createDtsQueryBuilder('treeClosure', entity, options);
        // typeorm老逻辑
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            this.alias,
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...pick(options, ['relations']),
            },
        );

        return entity;
    }

    /**
     * 查询祖先树
     * @param entity
     * @param options
     */
    async findAncestorsTree(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.buildBaseQB(
        //     this.createDescendantsQueryBuilder(this.alias, 'treeClosure', entity),
        // );
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createAtsQueryBuilder('treeClosure', entity, options);
        // 原生的组件查询处理
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);

        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'treeEntity',
            entities.raw,
        );
        TreeRepositoryUtils.buildParentEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
        );
        return entity;
    }

    /**
     * 查询后代元素
     * @param entity
     * @param options
     */
    async findDescendants(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.buildBaseQB(
        //     this.createDescendantsQueryBuilder(this.alias, 'treeClosure', entity),
        // );
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createDtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb.getMany();
    }

    /**
     * 查询祖先元素
     * @param entity
     * @param options
     */
    async findAncestors(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.buildBaseQB(
        //     this.createAncestorsQueryBuilder(this.alias, 'treeClosure', entity),
        // );
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createAtsQueryBuilder('treeClosure', entity, options);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb.getMany();
    }

    /**
     * 统计后代元素数量
     * @param entity
     * @param options
     */
    async countDescendants(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.createDescendantsQueryBuilder(this.alias, 'treeClosure', entity);
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createDtsQueryBuilder('treeClosure', entity, options);
        return qb.getCount();
    }

    /**
     * 统计祖先元素数量
     * @param entity
     * @param options
     */
    async countAncestors(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        // const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        // let qb = this.createAncestorsQueryBuilder(this.alias, 'treeClosure', entity);
        // qb = addQuery
        //     ? await addQuery(this.addOrderByQuery(qb, orderBy))
        //     : this.addOrderByQuery(qb, orderBy);
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) qb.where(`${this.alias}.deletedAt IS NOT NULL`);
        // }
        const qb = await this.createAtsQueryBuilder('treeClosure', entity, options);
        return qb.getCount();
    }

    /**
     * 打平并展开树
     * @param trees
     * @param level
     */
    async toFlatTrees(trees: E[], depth = 0, parent: E | null = null): Promise<E[]> {
        const data: Omit<E, 'children'>[] = [];
        for (const item of trees) {
            (item as any).depth = depth;
            (item as any).parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as E[];
    }
}
