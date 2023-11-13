import { DataSource, EntityManager } from 'typeorm';

import { CategoryEntity, PostEntity, TagEntity } from '@/modules/content/entities';
import { BaseSeeder } from '@/modules/database/base';
import { DbMock } from '@/modules/database/types';

import { CategoryData, categories } from '../mocks/content.data';

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
        console.log('items ', items);
        return items;
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
    }
}
