import { FindOptionsUtils, FindTreeOptions, TreeRepository } from 'typeorm';
import { CategoryEntity } from '../entities';
import { unset } from 'lodash';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

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
    fincRoots(options?: FindTreeOptions) {
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        // 构建基础查询器
        const qb = this.buildBaseQB();
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb
            .where(`${escapeAlias('category')}.${escapeColumn(parentPropertyName)} IS NULL`)
            .getMany();
    }

    /**
     * 查询entity的后代树
     * @param entity
     * @param options
     */
    findDescendants(entity: CategoryEntity, options?: FindTreeOptions): Promise<CategoryEntity[]> {
        // createDescendantsQueryBuilder日后会抽离方法，处理额外查询
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        return qb.getMany();
    }

    /**
     * 查找entity的祖先
     * @param entity
     * @param options
     */
    findAncestors(entity: CategoryEntity, options?: FindTreeOptions): Promise<CategoryEntity[]> {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        return qb.getMany();
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
