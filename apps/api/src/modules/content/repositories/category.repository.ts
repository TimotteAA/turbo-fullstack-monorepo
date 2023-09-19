import { unset } from 'lodash';
import { FindOptionsUtils, FindTreeOptions, TreeRepository } from 'typeorm';

import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities';

@CUSTOM_REPOSITORY(CategoryEntity)
export class CategoryRepository extends TreeRepository<CategoryEntity> {
    /**
     * 构建基础查询器，以后会进行抽取
     */
    buildBaseQB() {
        return this.createQueryBuilder('category')
            .leftJoinAndSelect('category.parent', 'parent')
            .orderBy('category.customOrder', 'ASC');
    }

    /**
     * 查询顶级分类
     * @param options
     */
    fincRoots(options?: FindTreeOptions & { onlyTrashed?: boolean; withTrashed?: boolean }) {
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 构建基础查询器
        const qb = this.buildBaseQB();
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        if (options.withTrashed) {
            qb.withDeleted();
            if (options.onlyTrashed) {
                qb.andWhere('category.deletedAt IS NOT NULL');
            }
        }
        return qb
            .where(`${escapeAlias('category')}.${escapeColumn(parentPropertyName)} IS NULL`)
            .getMany();
    }

    async findTrees(
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ) {
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询entity的后代树
     * @param entity
     * @param options
     */
    findDescendants(
        entity: CategoryEntity,
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ): Promise<CategoryEntity[]> {
        // createDescendantsQueryBuilder日后会抽离方法，处理额外查询
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getMany();
    }

    /**
     * 查找entity的祖先
     * @param entity
     * @param options
     */
    findAncestors(
        entity: CategoryEntity,
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ): Promise<CategoryEntity[]> {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getMany();
    }

    /**
     * 统计后代元素数量
     * @param entity
     * @param options
     */
    async countDescendants(
        entity: CategoryEntity,
        options?: { withTrashed?: boolean; onlyTrashed?: boolean },
    ) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getCount();
    }

    /**
     * 统计祖先元素数量
     * @param entity
     * @param options
     */
    async countAncestors(
        entity: CategoryEntity,
        options?: { withTrashed?: boolean; onlyTrashed?: boolean },
    ) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getCount();
    }

    /**
     * 打平并展开树
     * @param trees
     * @param level
     */
    async toFlatTrees(
        trees: CategoryEntity[],
        depth = 0,
        parent: CategoryEntity | null = null,
    ): Promise<CategoryEntity[]> {
        const data: Omit<CategoryEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            item.parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as CategoryEntity[];
    }
}
