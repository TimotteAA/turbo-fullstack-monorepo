import { Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base/base.service';
import { SelectTrashMode } from '@/modules/database/constants';
import { paginate } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';

import { PostOrderType } from '../constants';
import { PostEntity } from '../entities';
import { CategoryRepository, PostRepository, TagRepository } from '../repositories';
import type { SearchType } from '../types';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';

import { SearchService } from './search.service';

type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};
@Injectable()
export class PostService extends BaseService<PostEntity, PostRepository> {
    constructor(
        protected postRepo: PostRepository,
        protected categoryRepo: CategoryRepository,
        protected tagRepo: TagRepository,
        protected searchSevice: SearchService,
        protected searchType: SearchType,
    ) {
        super(postRepo);
    }

    async list(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
        if (this.searchType === 'meili' && this.searchSevice) {
            const { search, ...rest } = options;
            const result = await this.searchSevice.search(search, {
                page: rest.page,
                limit: rest.limit,
                trashed: rest.trashed,
                isPublished: rest.isPublished,
            });
            return result as any;
        }
        let qb = this.postRepo.buildBaseQB();
        qb = await this.buildListQuery(qb, options, callback);

        return paginate(qb, options);
    }

    // async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
    //     let qb = this.postRepo.buildBaseQB();
    //     qb = await this.buildListQuery(qb, options, callback);
    //     return paginate(qb, options);
    // }

    // async detail(id: string, callback?: QueryHook<PostEntity>) {
    //     let qb = this.postRepo.buildBaseQB();
    //     qb = qb.andWhere(`post.id = :id`, { id });
    //     qb = !isNil(callback) ? await callback(qb) : qb;
    //     const item = await qb.getOne();
    //     if (isNil(item)) {
    //         throw new BadRequestException(`post of id: ${id} does not exist`);
    //     }
    //     return item;
    // }

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
        if (this.searchType === 'meili') {
            await this.searchSevice.create(res);
        }
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
        const newPost = await this.detail(post.id);
        if (this.searchType === 'meili') {
            await this.searchSevice.update([newPost]);
        }
        return newPost;
    }

    async delete(ids: string[], trahsed?: boolean) {
        // 待删除的items
        const items = await this.postRepo.find({
            where: {
                id: In(ids),
            },
            withDeleted: true,
        });

        if (trahsed) {
            // 软删除
            const soft = [...items.filter((item) => isNil(item.deletedAt))];
            // 直接删除
            const direct = [...items.filter((item) => !isNil(item.deletedAt))];
            const directsRemoves = [...(await this.postRepo.remove(direct))];
            const softsRemoves = [...(await this.postRepo.softRemove(soft))];
            if (this.searchType === 'meili' && this.searchSevice) {
                await this.searchSevice.delete(direct.map(({ id }) => id));
                await this.searchSevice.update(soft);
            }
            return [...directsRemoves, ...softsRemoves];
        }

        if (this.searchType === 'meili' && this.searchSevice) {
            await this.searchSevice.delete(items.map(({ id }) => id));
        }
        return this.postRepo.remove(items);
    }

    /**
     * 从回收站中回收
     * @param ids
     */
    async restore(ids: string[]) {
        const items = await this.postRepo.find({
            where: {
                id: In(ids),
            },
            withDeleted: true,
        });
        // 过滤掉不在回收站中的数据
        const trasheds = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trasheds.length < 1) return [];
        await this.postRepo.restore(trasheds);
        const result = await this.postRepo.find({
            where: {
                id: In(trasheds),
            },
        });
        if (this.searchType === 'meili' && this.searchSevice) {
            await this.searchSevice.update(result);
        }
        const qb = await this.buildListQuery(this.postRepo.buildBaseQB(), {}, async (qbuilder) =>
            qbuilder.andWhereInIds(trasheds),
        );
        return qb.getMany();
    }

    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: FindParams = {},
        queryHook?: QueryHook<PostEntity>,
    ) {
        const { isPublished, orderBy, tag, category, trashed, search } = options;

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
        if (!isNil(search)) await this.querySearch(qb, search);
        if (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY) {
            // 查询软删除数据
            qb = qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) {
                // 仅查询deletedAt不为null的
                qb = qb.andWhere({
                    deletedAt: Not(IsNull()),
                });
            }
        }

        return this.queryOrderBy(qb, orderBy);
    }

    protected async querySearch(qb: SelectQueryBuilder<PostEntity>, search: string) {
        if (this.searchType === 'against') {
            qb.andWhere('MATCH (post.title) AGAINST (:search IN BOOLEAN MODE)', { search })
                .orWhere('MATCH (post.body) AGAINST (:search IN BOOLEAN MODE)', { search })
                .orWhere('MATCH (post.summary) AGAINST (:search IN BOOLEAN MODE)', { search })
                .orWhere('MATCH (category.name) AGAINST (:search IN BOOLEAN MODE)', { search })
                .orWhere('MATCH (tags.name) AGAINST (:search IN BOOLEAN MODE)', { search });
        } else if (this.searchType === 'like') {
            qb.andWhere('post.title LIKE :search', { search: `%${search}%` })
                .orWhere('post.body LIKE :search', { search: `%${search}%` })
                .orWhere('post.summary LIKE :search', { search: `%${search}%` })
                .orWhere('category.name LIKE :search', {
                    search: `%${search}%`,
                })
                .orWhere('tags.name LIKE :search', {
                    search: `%${search}%`,
                });
        }
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
