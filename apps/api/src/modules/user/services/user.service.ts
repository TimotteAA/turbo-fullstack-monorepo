import { Injectable, OnModuleInit } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { EntityNotFoundError, In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { BaseService } from '@/modules/database/base';
import { SelectTrashMode } from '@/modules/database/constants';
import { QueryHook } from '@/modules/database/types';
import { SystemRoles } from '@/modules/rbac/constants';
import { ResourceRepository, RoleRepository } from '@/modules/rbac/repositories';

import { UserOrderBy } from '../constants';
import { CreateUserDto, QueryUserDto, UdpateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';
import type { UserModuleConfig } from '../types';

type FindParams = Omit<QueryUserDto, 'page' | 'limit'>;

@Injectable()
export class UserService
    extends BaseService<UserEntity, UserRepository, FindParams>
    implements OnModuleInit
{
    /**
     * 服务启动自动创建超级管理员用户
     */
    async onModuleInit() {
        if (!(await this.configure.get<boolean>('app.start', false))) return null;
        const adminConf = await this.configure.get<UserModuleConfig['super']>('user.super');
        const admin = await this.findOneByCredential(adminConf.name);
        if (!isNil(admin)) {
            return admin;
        }
        const res = await this.create({
            ...adminConf,
            roles: [],
            resources: [],
        });
        return res;
    }

    constructor(
        private readonly repo: UserRepository,
        private readonly roleRepo: RoleRepository,
        private readonly resourceRepo: ResourceRepository,
        private readonly configure: Configure,
    ) {
        super(repo);
    }

    async create(data: CreateUserDto) {
        const res = await this.repo.save({
            ...omit(data, ['id', 'roles', 'resources']),
            roles: !isNil(data.roles)
                ? await this.roleRepo.find({
                      where: {
                          id: In(data.roles),
                      },
                  })
                : null,
            permissions: !isNil(data.resources)
                ? await this.resourceRepo.find({
                      where: {
                          id: In(data.resources),
                      },
                  })
                : null,
            actived: true,
        });
        await this.syncRoles(res.id);
        return this.detail(res.id);
    }

    async update(data: UdpateUserDto) {
        await this.repo.update(data.id, {
            ...omit(data, ['id', 'roles', 'resources']),
        });
        const user = await this.repo.findOne({
            where: {
                id: data.id,
            },
            relations: ['roles', 'permissions'],
        });
        if (!isNil(data.roles) && Array.isArray(data.roles)) {
            await this.repo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(user)
                .addAndRemove(data.roles ?? [], user.roles ?? []);
        }
        if (!isNil(data.resources) && Array.isArray(data.resources)) {
            await this.repo
                .createQueryBuilder('user')
                .relation(UserEntity, 'permissions')
                .of(user)
                .addAndRemove(data.resources ?? [], user.permissions ?? []);
        }
        await this.syncRoles(user.id);
        return this.detail(data.id);
    }

    /**
     * 从name、email、phone中查找
     */
    async findOneByCredential(credential: string) {
        const user = await this.repo.findOne({
            where: [{ name: credential }, { email: credential }, { phone: credential }],
        });
        return user;
    }

    async findOneById(id: string) {
        const user = await this.repo.findOne({
            where: {
                id,
            },
        });
        return user;
    }

    async findOneByConditions(conditions: Record<string, any>) {
        const query = this.repo.buildBaseQB();
        if (Object.keys(conditions).length > 0) {
            const wheres = Object.fromEntries(
                Object.entries(conditions).map(([key, value]) => [key, value]),
            );
            query.andWhere(wheres);
        }
        const user = query.getOne();
        if (isNil(user)) {
            throw new EntityNotFoundError(UserEntity, `${Object.keys(conditions).join(',')}`);
        }
        return user;
    }

    async test() {
        console.log('test ');
    }

    protected async buildListQB(
        qb: SelectQueryBuilder<UserEntity>,
        options?: FindParams,
        callback?: QueryHook<UserEntity>,
    ): Promise<SelectQueryBuilder<UserEntity>> {
        const { permission, role, orderBy, search, trashed } = options ?? {};
        if (!isNil(callback)) await callback(qb);

        if (!isNil(role)) qb.andWhere('roles.id = :id', { id: role });
        if (!isNil(permission)) qb.andWhere('permissions.id = :id', { id: permission });
        if (!isNil(search)) {
            qb.orWhere('user.name LIKE :search', { search })
                .orWhere('user.nickname LIKE :search', { search })
                .orWhere('user.summary LIKE :search', { search })
                .orWhere('user.email LIKE :search', { search })
                .orWhere('user.phone LIKE :search', { search });
        }
        if (!isNil(orderBy)) {
            switch (orderBy) {
                case UserOrderBy.UPDATE: {
                    qb.orderBy('user.updatedAt', 'DESC');
                    break;
                }
                default:
                    qb.orderBy('user.createdAt', 'ASC');
                    break;
            }
        }

        if (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY) {
            // 查询软删除数据
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) {
                // 仅查询deletedAt不为null的
                qb.andWhere({
                    deletedAt: Not(IsNull()),
                });
            }
        }

        return qb;
    }

    protected async syncRoles(userId: string) {
        const user = await this.repo.findOne({
            where: {
                id: userId,
            },
            relations: ['roles'],
        });
        const roleRelation = this.repo.createQueryBuilder('user').relation('roles').of(user);
        if (user.actived) {
            // 可以使用的账号
            const roleNames = (user.roles ?? []).map(({ name }) => name);
            // 是否有角色，没有角色添加普通角色
            const noRoles =
                roleNames.length <= 0 ||
                (!roleNames.includes(SystemRoles.USER) &&
                    !roleNames.includes(SystemRoles.SUPER_ADMIN));
            const isSuperAdmin = roleNames.includes(SystemRoles.SUPER_ADMIN);
            if (noRoles) {
                const customRole = await this.roleRepo.findOne({
                    where: {
                        name: SystemRoles.USER,
                    },
                    relations: ['users'],
                });
                if (!isNil(customRole)) roleRelation.add(customRole);
            } else if (isSuperAdmin) {
                if (!roleNames.includes(SystemRoles.SUPER_ADMIN)) {
                    const adminRole = await this.roleRepo.findOne({
                        where: {
                            name: SystemRoles.SUPER_ADMIN,
                        },
                        relations: ['users'],
                    });
                    if (!isNil(adminRole)) await roleRelation.add(adminRole);
                }
            }
        } else {
            await roleRelation.remove(user.roles ?? []);
        }
    }
}
