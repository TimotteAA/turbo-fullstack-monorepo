import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { ResourceRepository } from '../repositories';

import { ResourceEntity } from '../entities/resource.entity';

// type FindParams = {
//     [key in keyof Omit<QuerySystemDto, 'limit' | 'page'>]: QuerySystemDto[key];
// };

@Injectable()
export class ResourceService extends BaseService<ResourceEntity, ResourceRepository> {
    constructor(private repo: ResourceRepository) {
        super(repo);
    }

    async create(data: any) {
        return this.repo.save(omit(data, ['id']));
    }

    // async update(data: UpdateSystemDto) {
    //     await this.repo.update(data.id, omit(data, ['id', 'parent']));
    //     const updatedSys = await this.detail(data.id);
    //     // 新的父分类的entity
    //     const parent = await this.getParent(data.id, data.parent);

    //     // 前面两个判断：
    //     // parent不为null，更新前的为null
    //     // parent为null，更新前的parent不为null
    //     // 最后一个判断：更新前后的parent都存在，但是不一致
    //     const shouldUpdateParent =
    //         (isNil(updatedSys.parent) && !isNil(parent)) ||
    //         (!isNil(updatedSys.parent) && isNil(parent)) ||
    //         (!isNil(updatedSys.parent) && !isNil(parent) && parent.id !== updatedSys.parent.id);
    //     if (parent !== undefined && shouldUpdateParent) {
    //         updatedSys.parent = parent;
    //         await this.repo.save(updatedSys);
    //     }
    //     return updatedSys;
    // }

    // async paginate(
    //     options?: PaginateOptions & { search?: string },
    // ): Promise<PaginateReturn<SystemEntity>> {
    //     const data = await this.list(
    //         undefined,
    //         !isNil(options.search)
    //             ? async (qb) =>
    //                   qb
    //                       .andWhere('MATCH (system.name) AGAINST (:search IN BOOLEAN MODE)', {
    //                           search: options.search,
    //                       })
    //                       .andWhere(
    //                           'MATCH (system.description) AGAINST (:search IN BOOLEAN MODE)',
    //                           { search: options.search },
    //                       )
    //             : null,
    //     );
    //     return manualPaginate(options, data) as PaginateReturn<SystemEntity>;
    // }

    // // protected async buildListQB(
    // //     qb: SelectQueryBuilder<SystemEntity>,
    // //     options?: FindParams,
    // //     callback?: QueryHook<SystemEntity>,
    // // ): Promise<SelectQueryBuilder<SystemEntity>> {
    // //     if (!isNil(callback)) await callback(qb);
    // //     const { search } = options ?? {};
    // //     if (!isNil(search)) {
    // //         qb.andWhere('MATCH (system.name) AGAINST (:search IN BOOLEAN MODE)', {
    // //             search,
    // //         }).andWhere('MATCH (system.description) AGAINST (:search IN BOOLEAN MODE)', { search });
    // //     }
    // //     return qb;
    // // }

    // /**
    //  * 获取当前分类的父id
    //  * @param currentId 当前分类id
    //  * @param parent 父分类id
    //  */
    // protected async getParent(current?: string, parentId?: string) {
    //     // 两者一样，不正常返回undefined
    //     if (current === parentId) return undefined;
    //     // 可能仍然是undefined
    //     let parent: SystemEntity | undefined;
    //     if (parentId !== undefined) {
    //         // 顶级分类
    //         if (parentId === null) return null;
    //         parent = await this.repo.findOne({ where: { id: parentId } });
    //         if (!parent)
    //             throw new EntityNotFoundError(
    //                 SystemEntity,
    //                 `Parent category ${parentId} not exists!`,
    //             );
    //     }
    //     return parent;
    // }
}