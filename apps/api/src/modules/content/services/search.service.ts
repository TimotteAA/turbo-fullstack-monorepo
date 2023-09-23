import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { isNil, omit, pick } from 'lodash';
import MeiliSearch from 'meilisearch';

import { SelectTrashMode } from '@/modules/database/constants';
import { MeiliSearchService } from '@/modules/meilisearch/services';

import { PostEntity } from '../entities';
import { CategoryRepository, CommentRepository } from '../repositories';
import { SearchOptions } from '../types';

@Injectable()
export class SearchService {
    private client: MeiliSearch;

    private index = 'content';

    constructor(
        protected meiliSearvice: MeiliSearchService,
        protected categoryRepo: CategoryRepository,
        protected commentRepo: CommentRepository,
    ) {
        this.client = meiliSearvice.getClient();
    }

    /**
     * 发表文章时创建document
     * @param post
     */
    async create(post: PostEntity) {
        await this.client.index(this.index).addDocuments(await this.getPostDocument(post));
    }

    async delete(ids: string[]) {
        await this.client.index(this.index).deleteDocuments(ids);
    }

    async update(posts: PostEntity[]) {
        return this.client.index(this.index).updateDocuments(
            (await Promise.all(posts.map((post) => this.getPostDocument(post)))).map(
                // getPostDocument返回一个数组
                (item) => item[0],
            ),
        );
    }

    async search(text: string, options: SearchOptions) {
        await this.client.index(this.index).addDocuments([]);
        // 可以筛选的字段
        this.client.index(this.index).updateFilterableAttributes(['deletedAt', 'publishedAt']);
        // 排序字段
        this.client.index(this.index).updateSortableAttributes(['commentCount', 'updatedAt']);
        const option = { page: 1, limit: 10, trashed: SelectTrashMode.NONE, ...options };
        const limit = isNil(option.limit) || option.limit < 1 ? 1 : option.limit;
        const page = isNil(option.page) || option.page < 1 ? 1 : option.page;
        // 软删除的过滤条件，默认只查软删除数据
        let filter = ['deletedAt IS NULL'];
        if (option.trashed === SelectTrashMode.ALL) {
            filter = [];
        } else if (option.trashed === SelectTrashMode.ONLY) {
            // 不查软删除数据
            filter = ['deletedAt IS NOT NULL'];
        }
        if (!isNil(option.isPublished)) {
            filter.push(option.isPublished ? 'publishedAt IS NOT NULL' : 'publishedAt IS NULL');
        }
        const results = await this.client.index(this.index).search(text, {
            page,
            limit,
            filter,
            sort: ['updatedAt:desc', 'commentCount:desc'],
        });

        return {
            items: results.hits,
            meta: {
                currentPage: results.page,
                itemCount: results.totalHits,
                perPage: results.hitsPerPage,
                totalItems: results.estimatedTotalHits,
                ...omit(results, [
                    'hits',
                    'page',
                    'hitsPerPage',
                    'estimatedTotalHits',
                    'totalHits',
                ]),
            },
        };
    }

    /**
     * 将单篇文章转换成index document
     * @param post
     */
    protected async getPostDocument(post: PostEntity) {
        // 文章所有的分类（包括父级分类）
        const categories = [
            // { id: post.category.id, name: post.category.name },
            ...(await this.categoryRepo.findAncestors(post.category)).map(({ id, name }) => ({
                id,
                name,
            })),
        ];
        // 此处会重复添加
        // categories = categories.filter((c) => c.id !== post.category.id);
        // 文章评论
        const comments = await this.commentRepo.find({
            relations: ['post'],
            where: {
                post: {
                    id: post.id,
                },
            },
        });
        return [
            {
                ...pick(instanceToPlain(post), [
                    'id',
                    'title',
                    'body',
                    'summary',
                    'commentCount',
                    'deletedAt',
                    'publishedAt',
                    'createdAt',
                    'updatedAt',
                ]),
                categories,
                tags: post?.tags?.map((item) => ({ id: item?.id, name: item?.name })),
                comments,
            },
        ];
    }
}
