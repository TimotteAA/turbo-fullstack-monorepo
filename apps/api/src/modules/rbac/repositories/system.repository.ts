import { SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base';
import { TreeChildrenResolve } from '@/modules/database/constants';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { SystemEntity } from '../entities/system.entity';

@CUSTOM_REPOSITORY(SystemEntity)
export class SystemRepository extends BaseTreeRepository<SystemEntity> {
    protected _alias: string = 'system';

    protected _childrenResolve?: TreeChildrenResolve = TreeChildrenResolve.DELETE;

    buildBaseQB(): SelectQueryBuilder<SystemEntity> {
        return this.createQueryBuilder(this.alias)
            .leftJoinAndSelect('system.parent', 'parent')
            .orderBy('system.createdAt');
    }
}
