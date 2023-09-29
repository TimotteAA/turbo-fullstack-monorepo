import { BaseTreeRepository } from '@/modules/database/base';
import { TreeChildrenResolve } from '@/modules/database/constants';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities';

@CUSTOM_REPOSITORY(CategoryEntity)
export class CategoryRepository extends BaseTreeRepository<CategoryEntity> {
    protected _alias: string = 'category';

    protected _childrenResolve = TreeChildrenResolve.UP;

    /**
     * 构建基础查询器，以后会进行抽取
     */
    buildBaseQB() {
        return this.createQueryBuilder('category')
            .leftJoinAndSelect('category.parent', 'parent')
            .orderBy('category.customOrder', 'ASC');
    }
}
