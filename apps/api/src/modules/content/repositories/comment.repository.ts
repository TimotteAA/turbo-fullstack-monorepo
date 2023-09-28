import { FindTreeOptions, SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base';
import { TreeChildrenResolve } from '@/modules/database/constants';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { QueryParams } from '@/modules/database/types';

import { CommentEntity } from '../entities';

@CUSTOM_REPOSITORY(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    protected _alias = 'comment';

    protected _childrenResolve = TreeChildrenResolve.DELETE;

    /**
     * 构建基础查询器，以后会进行抽取
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>) {
        return qb
            .leftJoinAndSelect('comment.parent', 'parent')
            .leftJoinAndSelect('comment.post', 'post')
            .orderBy('comment.customOrder', 'ASC');
    }

    /**
     * @param options
     */
    async findTrees(
        options: FindTreeOptions & QueryParams<CommentEntity> & { post?: string } = {},
    ): Promise<CommentEntity[]> {
        return super.findTrees({
            ...options,
            addQuery: options.post
                ? async (qb) => qb.andWhere('post.id = :id', { id: options.post })
                : null,
        });
    }
}
