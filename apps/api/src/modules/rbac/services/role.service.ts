import { Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { In, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos';
import { RoleEntity } from '../entities';
import { ResourceRepository, RoleRepository, SystemRepository } from '../repositories';

type FindParams = {
    [key in keyof Omit<QueryRoleDto, 'page' | 'limit'>]: QueryRoleDto[key];
};

@Injectable()
export class RoleService extends BaseService<RoleEntity, RoleRepository> {
    constructor(
        protected readonly repo: RoleRepository,
        protected readonly sysRepo: SystemRepository,
        protected readonly resRepo: ResourceRepository,
    ) {
        super(repo);
    }

    async create(data: CreateRoleDto): Promise<RoleEntity> {
        const item = await this.repo.save({
            ...omit(data, ['system']),
            resources: !isNil(data.resources)
                ? await this.resRepo.find({
                      where: {
                          id: In(data.resources),
                      },
                  })
                : null,
        });
        return this.detail(item.id);
    }

    async update(data: UpdateRoleDto): Promise<RoleEntity> {
        const role = await this.repo.save(omit(data, ['id', 'resources']));

        if (!isNil(data.resources) && Array.isArray(data.resources)) {
            await this.repo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'resources')
                .of(role)
                .addAndRemove(data.resources ?? [], role.resources ?? []);
        }
        return this.detail(role.id);
    }

    protected async buildListQB(
        qb: SelectQueryBuilder<RoleEntity>,
        options?: FindParams,
        callback?: QueryHook<RoleEntity>,
    ): Promise<SelectQueryBuilder<RoleEntity>> {
        if (!isNil(callback)) await callback(qb);
        const { search } = options ?? {};
        if (!isNil(search)) {
            qb.andWhere('MATCH (role.name) AGAINST (:search IN BOOLEAN MODE)', {
                search,
            }).andWhere('MATCH (role.description) AGAINST (:search IN BOOLEAN MODE)', { search });
        }
        return qb;
    }
}
