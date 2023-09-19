import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { EntityNotFoundError, In, SelectQueryBuilder } from 'typeorm';

import { manualPaginate } from '@/modules/database/helpers';

import { CreateCommentDto, QueryCommentTreeDto, QueryCommentListDto } from '../dtos';
import { CommentEntity } from '../entities';
import { CommentRepository, PostRepository } from '../repositories';

@Injectable()
export class CommentService {
    constructor(
        protected repo: CommentRepository,
        protected postRepo: PostRepository,
    ) {}

    async findTrees(options: QueryCommentTreeDto = {}) {
        const { post } = options;
        if (isNil(post)) {
            return this.repo.findTrees();
        }

        const roots = await this.repo.findTrees({
            addQuery: async (qb) => qb.andWhere('post.id = :id', { id: post }),
        });
        return Promise.all(roots.map((root) => this.repo.findDescendantsTree(root)));
    }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(dto: QueryCommentListDto) {
        const { post, ...query } = dto;
        const addQuery = async (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, any> = {};
            if (!isNil(post)) condition.post = { id: post };
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        // 顶级分类
        const data = await this.repo.findRoots({
            addQuery,
        });
        let comments: CommentEntity[] = [];
        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            comments.push(
                await this.repo.findDescendantsTree(c, {
                    addQuery,
                }),
            );
        }
        comments = await this.repo.toFlatTrees(comments);
        return manualPaginate(query, comments);
    }

    async create(data: CreateCommentDto) {
        const item = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
            post: await this.getPost(data.post),
        });
        return this.detail(item.id);
    }

    async detail(id: string) {
        const comment = await this.repo.findOneByOrFail({ id });
        return comment;
    }

    async delete(ids: string[]) {
        const comment = await this.repo.findBy({ id: In(ids) });
        return this.repo.remove(comment);
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
