import { Repository } from 'typeorm';

import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { TagEntity } from '../entities';

@CUSTOM_REPOSITORY(TagEntity)
export class TagRepository extends Repository<TagEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .leftJoin('tag.posts', 'p')
            .addSelect('COUNT(p.id) as postCount')
            .groupBy('tag.id')
            .orderBy('tag.postCount', 'DESC')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts');
    }
}
