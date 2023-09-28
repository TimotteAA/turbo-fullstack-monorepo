import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { CommentEntity, PostEntity } from '../entities';

// 传入entity，在Database.forRepo时注册
@CUSTOM_REPOSITORY(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected _alias: string = 'post';

    buildBaseQB(): SelectQueryBuilder<PostEntity> {
        return this.createQueryBuilder('post')
            .leftJoinAndSelect('post.tags', 'tags')
            .leftJoinAndSelect('post.category', 'category')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where('c.post.id = post.id');
            }, 'commentCount')
            .loadRelationCountAndMap('post.commentCount', 'post.comments');
    }
}
