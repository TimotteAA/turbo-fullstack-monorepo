import { BadRequestException, Injectable } from '@nestjs/common';

import { isNil, omit } from 'lodash';
import { In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { paginate } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';

import { PostOrderType } from '../constants';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import { PostEntity } from '../entities';
import { CategoryRepository, PostRepository, TagRepository } from '../repositories';

type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};
@Injectable()
export class PostService {
    constructor(
        protected postRepo: PostRepository,
        protected categoryRepo: CategoryRepository,
        protected tagRepo: TagRepository,
    ) {}

    async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
        let qb = this.postRepo.buildBaseQB();
        qb = await this.buildListQuery(qb, options, callback);
        return paginate(qb, options);
    }

    async detail(id: string, callback?: QueryHook<PostEntity>) {
        let qb = this.postRepo.buildBaseQB();
        qb = qb.andWhere(`post.id = :id`, { id });
        qb = !isNil(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (isNil(item)) {
            throw new BadRequestException(`post of id: ${id} does not exist`);
        }
        return item;
    }

    async create(data: CreatePostDto) {
        const res = await this.postRepo.save({
            ...data,
            category: data.category
                ? await this.categoryRepo.findOneOrFail({
                      where: {
                          id: data.category,
                      },
                  })
                : null,
            tags: data.tags
                ? await this.tagRepo.find({
                      where: {
                          id: In(data.tags),
                      },
                  })
                : [],
        });
        return this.detail(res.id);
    }

    async update(data: UpdatePostDto) {
        await this.postRepo.update(data.id, omit(data, ['id', 'category', 'tags']));
        const post = await this.detail(data.id);
        // 更新tags的关联关系
        if (Array.isArray(data.tags)) {
            await this.postRepo
                .createQueryBuilder('post')
                .relation(PostEntity, 'tags')
                .of(post)
                .addAndRemove(data.tags ?? [], post.tags ?? []);
        }
        if (data.category !== undefined) {
            // null表示顶级分类
            const category = isNil(data.category)
                ? null
                : await this.categoryRepo.findOneByOrFail({ id: data.category });
            post.category = category;
            await this.postRepo.save(post);
        }
        return this.detail(post.id);
    }

    async delete(id: string) {
        const item = await this.postRepo.findOne({
            where: {
                id,
            },
        });
        if (isNil(item)) {
            throw new BadRequestException(`post of id ${id} does not exist`);
        }
        await this.postRepo.delete(id);
    }

    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: FindParams = {},
        queryHook?: QueryHook<PostEntity>,
    ) {
        const { isPublished, orderBy, tag, category } = options;
        if (typeof isPublished === 'boolean') {
            if (isPublished === true) {
                qb.andWhere({
                    publishedAt: Not(IsNull()),
                });
            } else {
                qb.andWhere({
                    publishedAt: IsNull(),
                });
            }
        }
        if (!isNil(tag)) qb.andWhere('tags.id = :id', { id: tag });
        if (!isNil(category)) await this.queryByCategory(qb, category);
        if (!isNil(queryHook)) await queryHook(qb);
        return this.queryOrderBy(qb, orderBy);
    }

    protected queryOrderBy(qb: SelectQueryBuilder<PostEntity>, orderBy: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATEDAT:
                qb = qb.addOrderBy('post.createdAt', 'DESC');
                break;
            case PostOrderType.UPDATEDAT:
                qb = qb.addOrderBy('post.updatedAt', 'ASC');
                break;
            case PostOrderType.PUBLISHED:
                qb = qb.addOrderBy('post.publishedAt', 'ASC');
                break;
            case PostOrderType.CUSTOM:
                qb = qb.addOrderBy('post.customOrder', 'DESC');
                break;
            case PostOrderType.COMMENTCOUNT:
                qb = qb.addOrderBy('commentCount', 'ASC');
                break;
            default:
                return qb
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC')
                    .addOrderBy('commentCount', 'ASC');
        }
        return qb;
    }

    protected async queryByCategory(qb: SelectQueryBuilder<PostEntity>, id: string) {
        const root = await this.categoryRepo.findOneBy({ id });
        const tree = await this.categoryRepo.findDescendantsTree(root);
        const flatDes = await this.categoryRepo.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return qb.andWhere('category.id IN (:...ids)', {
            ids,
        });
    }
}
