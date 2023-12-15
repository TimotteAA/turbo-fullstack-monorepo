import { BadRequestException, Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { ResourceType, SystemRoles } from '../constants';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos';
import { ResourceEntity, RoleEntity } from '../entities';
import { ResourceRepository, RoleRepository, SystemRepository } from '../repositories';
import { generateRouters } from '../utils';

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
            ...omit(data, ['resources']),
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

    async delete(ids: string[], trashed?: boolean): Promise<RoleEntity[]> {
        const items = await this.repo.find({
            where: {
                id: In(ids),
            },
        });
        items.forEach((item) => {
            if (item.systemed) {
                throw new BadRequestException(RoleEntity, '不能删除系统角色');
            }
        });
        return super.delete(ids, false);
    }

    async update(data: UpdateRoleDto): Promise<RoleEntity> {
        await this.repo.update(data.id, omit(data, ['id', 'resources']));
        const role = await this.repo.findOne({
            where: {
                id: data.id,
            },
            relations: ['resources'],
        });
        if (!isNil(data.resources) && Array.isArray(data.resources)) {
            await this.repo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'resources')
                .of(role)
                .addAndRemove(data.resources ?? [], role.resources ?? []);
        }
        return this.detail(role.id);
    }

    async getMenusAndPermissions(ids: string[]) {
        const roles = await this.repo.find({
            where: {
                id: In(ids),
            },
        });

        // reduce拿到去重
        const resources = (
            await this.resRepo
                .createQueryBuilder('resource')
                .leftJoinAndSelect('resource.parent', 'parent')
                // .leftJoinAndSelect('resource.children', 'children')
                .leftJoinAndSelect('resource.roles', 'role')
                .where('role.id IN (:...roleIds)', { roleIds: roles.map((r) => r.id) })
                .getMany()
        ).reduce<ResourceEntity[]>(
            (o, n) => (o.findIndex((i) => i.id === n.id) !== -1 ? [...o] : [...o, n]),
            [],
        );

        const flatMenus = resources
            .filter((resource) => resource.type !== ResourceType.ACTION)
            .map((r) => omit(r, ['permission', 'description', 'createdAt', 'updatedAt', 'roles']));

        const permissions = resources
            .filter((resource) => resource.type === ResourceType.ACTION)
            .map((r) => r.permission);

        return { menus: this.getMenuTree(flatMenus as ResourceEntity[], null), permissions };
    }

    async getMenus(userId: string) {
        const roles = await this.repo.find({
            where: {
                users: {
                    id: userId,
                },
            },
        });
        // 超级管理员
        if (roles.map(({ name }) => name).includes(SystemRoles.SUPER_ADMIN)) {
            const menus = await this.resRepo
                .createQueryBuilder('resource')
                .leftJoinAndSelect('resource.parent', 'parent')
                .orderBy('resource.customOrder', 'ASC')
                .getMany();
            return generateRouters(menus);
        }
        const menus = await this.resRepo.find({
            where: {
                roles: {
                    id: In(roles.map(({ id }) => id)),
                },
            },
            relations: ['parent'],
        });
        return generateRouters(menus);
    }

    async getPermissions(userId: string) {
        const roles = await this.repo.find({
            where: {
                users: {
                    id: userId,
                },
            },
        });
        const res: string[] = [];
        // 超级管理员
        if (roles.map(({ name }) => name).includes(SystemRoles.SUPER_ADMIN)) {
            const permissions = await this.resRepo.find({
                where: {
                    type: ResourceType.ACTION,
                    rule: Not(IsNull()),
                    roles: {
                        name: SystemRoles.SUPER_ADMIN,
                    },
                },
            });
            res.push(...permissions.map((permission) => permission.name));
        } else {
            const permissions = await this.resRepo.find({
                where: {
                    type: ResourceType.ACTION,
                    rule: Not(IsNull()),
                    roles: {
                        id: In(roles.map((role) => role.id)),
                    },
                },
            });
            res.push(...permissions.map((p) => p.name));
        }
        return res;
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
