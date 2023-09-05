import {
    FindOptionsUtils,
    FindTreeOptions,
    SelectQueryBuilder,
    TreeRepository,
    TreeRepositoryUtils,
} from 'typeorm';
import { CommentEntity } from '../entities';
import { isNil, unset } from 'lodash';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (
        query: SelectQueryBuilder<CommentEntity>,
    ) => Promise<SelectQueryBuilder<CommentEntity>>;
};

@CUSTOM_REPOSITORY(CommentEntity)
export class CommentRepository extends TreeRepository<CommentEntity> {
    /**
     * 构建基础查询器，以后会进行抽取
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>) {
        return qb
            .leftJoinAndSelect('comment.parent', 'parent')
            .leftJoinAndSelect('comment.post', 'post')
            .orderBy('comment.', 'ASC');
    }

    /**
     * findTress -> 调用findRoots -> 调用buildBaseQB
     * @param options
     */
    async findTrees(options?: FindTreeOptions): Promise<CommentEntity[]> {
        // comment的relations
        options.relations = ['parent', 'children'];
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询顶级分类
     * @param options
     */
    async findRoots(options: FindCommentTreeOptions = {}) {
        const { addQuery, ...rest } = options;
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 构建基础查询器
        let qb = this.buildBaseQB(this.createQueryBuilder('comment'));
        // 下面两行是源码
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, rest);
        qb.where(`${escapeAlias('comment')}.${escapeColumn(parentPropertyName)} IS NULL`);
        if (!isNil(addQuery)) {
            qb = await addQuery(qb);
        }
        return qb.getMany();
    }

    /**
     * 构建后代基础查询器，封装排序、额外查询等逻辑
     * @param closureTableAlias
     * @param entity
     * @param options
     */
    async createDtsQueryBuilder(
        closureTableAlias: string,
        entity: CommentEntity,
        options: FindCommentTreeOptions = {},
    ) {
        // CRUD抽象框架逻辑
        // const { addQuery, orderBy: order, withTrashed, onlyTrashed } = options;
        const { addQuery } = options;
        // 基础查询器
        let qb = this.buildBaseQB(
            super.createDescendantsQueryBuilder('comment', closureTableAlias, entity),
        );
        // 额外查询
        qb = !isNil(addQuery) ? await addQuery(qb) : qb;
        // // 软删除
        // if (withTrashed) {
        //     qb.withDeleted();
        //     if (onlyTrashed) {
        //         qb = qb.andWhere(`${this.qbName}.deletedAt IS NOT NULL`);
        //     }
        // }
        // // 处理排序
        // const orderBy = order ?? this.orderBy;
        // if (!isNil(orderBy)) {
        //     qb = this.addOrderByQuery(qb, orderBy);
        // }
        return qb;
    }

    async findDescendantsTree(
        entity: CommentEntity,
        options: FindCommentTreeOptions = {},
    ): Promise<CommentEntity> {
        // 在typeorm源代码的基础上修改了qb的创建逻辑：调用自己的createDtsQueryBuilder，再调用createDescendantsQueryBuilder
        const qb: SelectQueryBuilder<CommentEntity> = await this.createDtsQueryBuilder(
            'treeClosure',
            entity,
            options,
        );
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);

        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'treeEntity',
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...options,
            },
        );

        return entity;
    }

    /**
     * 打平并展开树
     * @param trees
     * @param level
     */
    async toFlatTrees(
        trees: CommentEntity[],
        depth = 0,
        parent: CommentEntity | null = null,
    ): Promise<CommentEntity[]> {
        const data: Omit<CommentEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            item.parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as CommentEntity[];
    }
}
