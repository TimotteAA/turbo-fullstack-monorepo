import { Injectable } from '@nestjs/common';

import { EntityNotFoundError } from 'typeorm';

import { BaseService } from '@/modules/database/base/base.service';

import { QueryHook } from '@/modules/database/types';

import { CreateCommentDto, QueryCommentListDto, QueryCommentTreeDto } from '../dtos';
import { CommentEntity } from '../entities';
import { CommentRepository, PostRepository } from '../repositories';

@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository> {
    protected enableTrash = false;

    constructor(
        protected repo: CommentRepository,
        protected postRepo: PostRepository,
    ) {
        super(repo);
    }

    async findTrees(options: QueryCommentTreeDto = {}) {
        return this.repository.findTrees(options);
    }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(dto: QueryCommentListDto) {
        const callback: QueryHook<CommentEntity> = dto.post
            ? async (qb) => qb.andWhere(`post.id = :id`, { id: dto.post })
            : null;
        return super.paginate(
            {
                page: dto.page,
                limit: dto.limit,
            },
            callback,
        );
    }

    async create(data: CreateCommentDto) {
        const item = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
            post: await this.getPost(data.post),
        });
        return this.detail(item.id);
    }

    protected async getPost(post: string) {
        const item = await this.postRepo.findOneBy({ id: post });
        return item;
    }

    /**
     * 获取请求传入的父评论
     * @param current 当前评论的ID
     * @param id
     */
    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repo.findOne({
                relations: ['parent', 'post'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }
}
