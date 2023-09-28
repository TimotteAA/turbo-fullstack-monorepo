import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { TagEntity } from '../entities';

@CUSTOM_REPOSITORY(TagEntity)
export class TagRepository extends BaseRepository<TagEntity> {
    protected _alias: string = 'tag';

    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .addSelect('COUNT(p.id)', 'postCount')
            .leftJoin('tag.posts', 'p')
            .groupBy('tag.id')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts')
            .orderBy('postCount', 'DESC');
    }
}
