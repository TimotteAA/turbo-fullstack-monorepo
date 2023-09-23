import { Repository } from 'typeorm';

import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { TagEntity } from '../entities';

@CUSTOM_REPOSITORY(TagEntity)
export class TagRepository extends Repository<TagEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .addSelect('COUNT(p.id)', 'postCount')
            .leftJoin('tag.posts', 'p')
            .groupBy('tag.id')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts')
            .orderBy('postCount', 'DESC');
    }
}
// buildBaseQB() {
//     return this.createQueryBuilder('tag')
//         .leftJoinAndSelect('tag.posts', 'posts')
//         .addSelect(
//             (subQuery) => subQuery.select('COUNT(p.id)', 'count').from(PostEntity, 'p'),
//             'postCount',
//         )
//         .orderBy('postCount', 'DESC')
//         .loadRelationCountAndMap('tag.postCount', 'tag.posts');
// }
