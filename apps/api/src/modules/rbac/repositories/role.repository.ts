import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { RoleEntity } from '../entities';

@CUSTOM_REPOSITORY(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {
    protected _alias: string = 'role';

    buildBaseQB(): SelectQueryBuilder<RoleEntity> {
        return this.createQueryBuilder('role').orderBy('role.createdAt', 'ASC');
    }
}
