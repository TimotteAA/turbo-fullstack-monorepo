import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { PostEntity, TagEntity } from '../entities';

@CUSTOM_REPOSITORY(TagEntity)
export class TagRepository extends BaseRepository<TagEntity> {
    protected _alias: string = 'tag';

    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .leftJoinAndSelect('tag.posts', 'posts')
            .addSelect(
                (subQuery) => subQuery.select('COUNT(p.id)', 'count').from(PostEntity, 'p'),
                'postCount',
            )
            .orderBy('postCount', 'DESC')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts')
            .orderBy('tag.customOrder', 'DESC');
    }
}
