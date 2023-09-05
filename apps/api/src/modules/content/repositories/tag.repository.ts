import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';
import { TagEntity } from '../entities';
import { Repository } from 'typeorm';

@CUSTOM_REPOSITORY(TagEntity)
export class TagRepository extends Repository<TagEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .addSelect('COUNT(p.id) as postCount')
            .leftJoin('tag.posts', 'p')
            .groupBy('tag.id')
            .orderBy('postCount', 'DESC')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts');
    }
}
