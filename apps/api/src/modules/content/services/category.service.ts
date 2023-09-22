import { Injectable } from '@nestjs/common';

import { isNil, omit } from 'lodash';
import { EntityNotFoundError, In } from 'typeorm';

import { SelectTrashMode } from '@/modules/database/constants';
import { manualPaginate } from '@/modules/database/helpers';

import {
    CreateCategoryDto,
    QueryCategoryDto,
    QueryCategoryTreeDto,
    UpdateCategoryDto,
} from '../dtos';
import { CategoryEntity } from '../entities';
import { CategoryRepository } from '../repositories';

@Injectable()
export class CategoryService {
    constructor(protected repo: CategoryRepository) {}

    async findTrees(options: QueryCategoryTreeDto) {
        const { trashed } = options;
        const tree = await this.repo.findTrees({
            withTrashed: trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY,
            onlyTrashed: trashed === SelectTrashMode.ONLY,
        });
        return tree;
    }

    async paginate(options: QueryCategoryDto) {
        const { trashed = SelectTrashMode.NONE } = options;
        const tree = await this.repo.findTrees({
            withTrashed: trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY,
            onlyTrashed: trashed === SelectTrashMode.ONLY,
        });
        console.log('tree ', tree);
        const data = await this.repo.toFlatTrees(tree);
        return manualPaginate(options, data);
    }

    async create(data: CreateCategoryDto) {
        const cate = await this.repo.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
        });
        return this.detail(cate.id);
    }

    async update(data: UpdateCategoryDto) {
        await this.repo.update(data.id, omit(data, ['id', 'parent']));
        const updatedCat = await this.detail(data.id);
        // 新的父分类的entity
        const parent = await this.getParent(data.id, data.parent);

        // 前面两个判断：
        // parent不为null，更新前的为null
        // parent为null，更新前的parent不为null
        // 最后一个判断：更新前后的parent都存在，但是不一致
        const shouldUpdateParent =
            (isNil(updatedCat.parent) && !isNil(parent)) ||
            (!isNil(updatedCat.parent) && isNil(parent)) ||
            (!isNil(updatedCat.parent) && !isNil(parent) && parent.id !== updatedCat.parent.id);
        if (parent !== undefined && shouldUpdateParent) {
            updatedCat.parent = parent;
            await this.repo.save(updatedCat);
        }
        return updatedCat;
    }

    async detail(id: string) {
        const cate = await this.repo.findOneByOrFail({ id });
        return cate;
    }

    async delete(ids: string[], trashed?: boolean) {
        const items = await this.repo.find({
            where: {
                id: In(ids),
            },
            relations: ['parent', 'children'],
            // 软删除
            withDeleted: true,
        });
        for (const item of items) {
            // 把子分类提示一级
            if (!isNil(item.children) && item.children.length > 0) {
                const nChildren = item.children.map((child) => {
                    child.parent = item.parent;
                    return child;
                });
                await this.repo.save(nChildren);
            }
        }
        // 处理软删除
        if (trashed) {
            const directs = items.filter((item) => !isNil(item.deletedAt));
            const softs = items.filter((item) => isNil(item.deletedAt));
            return [...(await this.repo.remove(directs)), ...(await this.repo.softRemove(softs))];
        }
        return this.repo.remove(items);
    }

    async restore(ids: string[]) {
        const items = await this.repo.find({
            where: {
                id: In(ids),
            },
            // 软删除
            withDeleted: true,
        });
        const trasheds = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trasheds.length < 1) return [];
        await this.repo.restore(trasheds);
        const qb = this.repo.buildBaseQB();
        qb.andWhereInIds(trasheds);
        return qb.getMany();
    }

    /**
     * 获取当前分类的父id
     * @param currentId 当前分类id
     * @param parent 父分类id
     */
    protected async getParent(current?: string, parentId?: string) {
        // 两者一样，不正常返回undefined
        if (current === parentId) return undefined;
        // 可能仍然是undefined
        let parent: CategoryEntity | undefined;
        if (parentId !== undefined) {
            // 顶级分类
            if (parentId === null) return null;
            parent = await this.repo.findOne({ where: { id: parentId } });
            if (!parent)
                throw new EntityNotFoundError(
                    CategoryEntity,
                    `Parent category ${parentId} not exists!`,
                );
        }
        return parent;
    }
}
