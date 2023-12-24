import { resolve } from 'path';

import { faker } from '@faker-js/faker';
import { existsSync, readFileSync } from 'fs-extra';
import { DataSource, EntityManager, In } from 'typeorm';

import { CategoryEntity, CommentEntity, PostEntity, TagEntity } from '@/modules/content/entities';
import { getRandomListData, panic } from '@/modules/core/utils';
import { BaseSeeder } from '@/modules/database/base';
import { DbMock } from '@/modules/database/types';
import { UserEntity } from '@/modules/user/entities';

import { CategoryData, PostData, TagData, categories, posts, tags } from '../mocks/content.data';
import { IPostMockOptions } from '../mocks/content.mock';

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, CategoryEntity, TagEntity];

    protected mock: DbMock;

    private async loadCategorys(data: CategoryData[]) {
        const items: CategoryEntity[] = [];
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.name = item.name;
            if (item.children) {
                category.children = await this.loadCategorys(item.children);
            }
            if (Math.random() > 0.5) {
                category.deletedAt = new Date(Date.now() - 500000090);
            }
            category.customOrder = order;
            order++;
            await this.em.save(category);
            items.push(category);
        }
        return items;
    }

    private async loadTags(data: TagData[]) {
        const items: TagEntity[] = [];
        let order = 0;
        for (const item of data) {
            const tag = new TagEntity();
            tag.name = item.name;
            tag.customOrder = order;
            await this.em.save(tag);
            items.push(tag);
            order++;
        }
        return items;
    }

    private async loadPosts(data: PostData[]) {
        const allTags = await this.em.find(TagEntity);
        const allCategories = await this.em.find(CategoryEntity);
        const superUser = await this.em.findOne(UserEntity, {
            where: {
                name: 'timotte',
            },
        });
        for (const item of data) {
            const filePath = resolve(__dirname, '../../assets/posts', item.contentFile);
            if (!existsSync(filePath)) {
                panic({
                    spinner: this.spinner,
                    message: `post data file of ${item.contentFile} does not exists!`,
                });
            }
            // mock
            const options: IPostMockOptions = {
                title: item.title,
                summary: item.summary,
                body: readFileSync(filePath, 'utf-8'),
                isPublished: true,
            };
            const categroyRepo = this.em.getRepository(CategoryEntity);
            if (item.category) {
                options.category = await categroyRepo.findOneBy({
                    name: item.category,
                });
            }
            const tagRepo = this.em.getRepository(TagEntity);
            if (item.tags) {
                options.tags = await tagRepo.findBy({
                    name: In(item.tags),
                });
            }
            options.author = superUser;
            const post = await this.mock(PostEntity)<IPostMockOptions>(options).create();
            await this.genRandomComments(post, 5, null);
        }
        const users = await this.em.find(UserEntity);
        for (let i = 0; i < 10; i++) {
            const user = getRandomListData(1, users) as UserEntity;
            await this.mock(PostEntity)<IPostMockOptions>({
                tags: getRandomListData(3, allTags) as TagEntity[],
                category: getRandomListData(1, allCategories) as CategoryEntity,
                author: user,
                isPublished: Math.random() > 0.65,
            }).create();
        }
    }

    private async genRandomComments(post: PostEntity, count: number, parent?: CommentEntity) {
        const users = await this.em.find(UserEntity);
        const comments: CommentEntity[] = [];
        for (let i = 0; i < count; i++) {
            const comment = new CommentEntity();
            comment.body = faker.lorem.paragraph(1);
            comment.post = post;
            if (parent) comment.parent = parent;
            comment.author = getRandomListData(1, users) as UserEntity;
            comments.push(await this.em.save(comment));
            if (Math.random() >= 0.9) {
                comment.children = await this.genRandomComments(
                    post,
                    Math.floor(Math.random() * 2),
                    comment,
                );
                await this.em.save(comment);
            }
        }
        return comments;
    }

    protected async run(
        _mock: DbMock,
        _dataSource?: DataSource,
        _em?: EntityManager,
    ): Promise<any> {
        this.mock = _mock;
        this.dataSource = _dataSource;
        this.em = _em;
        await this.loadCategorys(categories);
        await this.loadTags(tags);
        await this.loadPosts(posts);
    }
}
