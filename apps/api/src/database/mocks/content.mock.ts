import * as fakerJs from '@faker-js/faker';

import { CategoryEntity, CommentEntity, PostEntity, TagEntity } from '@/modules/content/entities';
import { getFakerLocales } from '@/modules/core/utils';
import { defindMock } from '@/modules/database/helpers';

// 用fakerjs模拟出来的数据字段
export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    category: CategoryEntity;
    tags: TagEntity[];
    comments: CommentEntity[];
}>;
export const ContentMock = defindMock<PostEntity, IPostFactoryOptions>(
    PostEntity,
    async (configure, options) => {
        const faker = new fakerJs.Faker({
            locale: await getFakerLocales(configure),
        });
        const post = new PostEntity();

        if (options.title) post.title = options.title;
        if (options.summary) post.summary = options.summary;
        if (options.isPublished) post.publishedAt = new Date();
        if (options.body) {
            post.body = options.body;
        } else {
            post.body = faker.lorem.paragraph(200);
        }
        if (options.comments) post.comments = options.comments;
        if (options.tags) post.tags = options.tags;
        if (options.category) post.category = options.category;

        return post;
    },
);
