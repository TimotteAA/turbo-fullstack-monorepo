import { Repository } from 'typeorm';

import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { CommentEntity, PostEntity } from '../entities';

// 传入entity，在Database.forRepo时注册
@CUSTOM_REPOSITORY(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    buildBaseQB() {
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
