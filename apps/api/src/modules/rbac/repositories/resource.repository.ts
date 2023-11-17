import { SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base';
import { TreeChildrenResolve } from '@/modules/database/constants';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { ResourceEntity } from '../entities/resource.entity';

@CUSTOM_REPOSITORY(ResourceEntity)
export class ResourceRepository extends BaseTreeRepository<ResourceEntity> {
    protected _alias: string = 'resource';

    protected _childrenResolve?: TreeChildrenResolve = TreeChildrenResolve.DELETE;

    buildBaseQB(): SelectQueryBuilder<ResourceEntity> {
        return this.createQueryBuilder('resource')
            .leftJoinAndSelect('resource.parent', 'parent')
            .orderBy('resource.createtAt', 'ASC');
    }
}
