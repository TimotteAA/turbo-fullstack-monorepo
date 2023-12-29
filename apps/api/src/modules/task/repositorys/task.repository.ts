import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { TaskEntity } from '../entities';

@CUSTOM_REPOSITORY(TaskEntity)
export class TaskRepository extends BaseRepository<TaskEntity> {
    protected _alias = 'task';

    buildBaseQB(): SelectQueryBuilder<TaskEntity> {
        return this.createQueryBuilder(this.alias);
    }
}
