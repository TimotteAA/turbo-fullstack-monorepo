import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { UserEntity } from '../entities/user.entity';

@CUSTOM_REPOSITORY(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    protected _alias: string = 'user';

    protected orderBy = 'createtAt';

    buildBaseQB(): SelectQueryBuilder<UserEntity> {
        return this.createQueryBuilder('user').leftJoinAndSelect('user.roles', 'roles');
    }
}
