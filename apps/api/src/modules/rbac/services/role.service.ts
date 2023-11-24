import { Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { In, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { ResourceType } from '../constants';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos';
import { ResourceEntity, RoleEntity } from '../entities';
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

    /**
     * 感觉下面的构建菜单树很蠢。。。
     * @param flat
     * @param parent
     */
    protected getMenuTree(flat: ResourceEntity[], parent: ResourceEntity | null) {
        const res: ResourceEntity[] = [];
        for (const resource of flat) {
            // 检查是否是当前父节点的子节
            if (
                (parent === null && resource.parent === parent) ||
                (resource.parent !== null && parent !== null && resource.parent.id === parent.id)
            ) {
                // 递归地构建这个资源的子树
                resource.children = this.getMenuTree(flat, resource);
                res.push(resource);
            }
        }

        // 清理所有节点的 parent 引用
        this.cleanParentReferences(res);

        return res;
    }

    protected cleanParentReferences(tree: ResourceEntity[]) {
        tree.forEach((node) => {
            // 删除 parent 属性
            delete node.parent;
            delete node.id;

            // 如果有子节点，递归地清理它们
            if (node.children && node.children.length > 0) {
                this.cleanParentReferences(node.children);
            }
        });
    }
}
