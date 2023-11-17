import { Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos';
import { RoleEntity } from '../entities';
import { RoleRepository, SystemRepository } from '../repositories';

type FindParams = {
    [key in keyof Omit<QueryRoleDto, 'page' | 'limit'>]: QueryRoleDto[key];
};

@Injectable()
export class RoleService extends BaseService<RoleEntity, RoleRepository> {
    constructor(
        protected readonly repo: RoleRepository,
        protected readonly sysRepo: SystemRepository,
    ) {
        super(repo);
    }

    async create(data: CreateRoleDto): Promise<RoleEntity> {
        const item = await this.repo.save({
            ...omit(data, ['system']),
            system: isNil(data.system)
                ? null
                : await this.sysRepo.findOneOrFail({
                      where: {
                          id: data.system,
                      },
                  }),
        });
        return this.detail(item.id);
    }

    async update(data: UpdateRoleDto): Promise<RoleEntity> {
        const role = await this.repo.save(omit(data, ['id', 'system']));
        if (data.system !== undefined) {
            const system =
                data.system === null
                    ? null
                    : await this.sysRepo.findOneOrFail({ where: { id: data.system } });
            role.system = system;
            await this.repo.save(role);
        }
        return this.detail(role.id);
    }

    protected async buildListQB(
        qb: SelectQueryBuilder<RoleEntity>,
        options?: FindParams,
        callback?: QueryHook<RoleEntity>,
    ): Promise<SelectQueryBuilder<RoleEntity>> {
        if (!isNil(callback)) await callback(qb);
        const { search, system } = options ?? {};
        if (!isNil(search)) {
            qb.andWhere('MATCH (role.name) AGAINST (:search IN BOOLEAN MODE)', {
                search,
            }).andWhere('MATCH (role.description) AGAINST (:search IN BOOLEAN MODE)', { search });
        }
        if (!isNil(system)) {
            await this.queryBySystem(qb, system);
        }
        return qb;
    }

    protected async queryBySystem(qb: SelectQueryBuilder<RoleEntity>, system: string) {
        // 查询指定部门的所有子部门
        const root = await this.sysRepo.findOne({ where: { id: system } });
        const tree = await this.sysRepo.findDescendantsTree(root);
        const flatTree = await this.sysRepo.toFlatTrees(tree.children);
        const ids = [root.id, ...flatTree.map(({ id }) => id)];
        return qb.andWhere('role.system IN (:...ids)', { ids });
    }
}
