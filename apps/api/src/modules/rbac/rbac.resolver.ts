import { AbilityOptions, AbilityTuple, MongoQuery, SubjectType } from '@casl/ability';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { isNil, omit, isArray } from 'lodash';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import { Configure } from '../config/configure';
import { deepMerge } from '../config/utils';
import { UserEntity } from '../user/entities';
import type { UserModuleConfig } from '../user/types';

import { PermissionAction, ResourceType as PermissionType, Status, SystemRoles } from './constants';
import { ResourceEntity } from './entities';
import { RoleEntity } from './entities/role.entity';
import { ResourceType, Role } from './types';

/**
 * casl管理的对象subject
 * @param subject
 */
const getSubject = <S extends SubjectType>(subject: S) => {
    if (typeof subject === 'string') return subject;
    if (subject.modelName) return subject;
    return subject.name;
};
@Injectable()
export class RbacResolver<A extends AbilityTuple = AbilityTuple, C extends MongoQuery = MongoQuery>
    implements OnApplicationBootstrap
{
    protected setuped = false;

    protected options: AbilityOptions<A, C>;

    // 内置角色
    protected _roles: Role[] = [
        {
            name: SystemRoles.USER,
            label: '普通用户',
            resources: [],
        },
        {
            name: SystemRoles.SUPER_ADMIN,
            label: '超级管理员',
            resources: [],
        },
    ];

    // 内置超级管理员权限
    protected _permissions: ResourceType<A, C>[] = [
        {
            name: 'manage-all',
            label: '超级管理员权限',
            description: '管理系统的所有功能',
            rule: {
                action: PermissionAction.MANAGE,
                subject: 'all',
            } as any,
            type: PermissionType.ACTION,
            status: Status.ENABLED,
            customOrder: 0,
        },
        {
            name: 'system',
            label: '系统管理',
            path: '/system',
            status: Status.ENABLED,
            type: PermissionType.DIRECTORY,
            customOrder: 1,
            children: [
                {
                    name: 'system.user',
                    path: '/system/user',
                    label: '用户管理',
                    description: '用户管理菜单',
                    status: Status.ENABLED,
                    type: PermissionType.MENU,
                    customOrder: 2,
                    rule: {
                        action: PermissionAction.VISIT,
                        subject: UserEntity,
                    } as any,
                    children: [
                        {
                            name: 'system.user.list',
                            path: '',
                            label: '查看用户列表',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 4,
                            rule: {
                                action: PermissionAction.LIST,
                                subject: UserEntity,
                            } as any,
                        },
                        {
                            name: 'system.user.create',
                            path: '',
                            label: '新增',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 4,
                            rule: {
                                action: PermissionAction.CREATE,
                                subject: UserEntity,
                            } as any,
                        },
                        {
                            name: 'system.user.detail',
                            path: '',
                            label: '详情',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 5,
                            rule: {
                                action: PermissionAction.DETAIL,
                                subject: UserEntity,
                            } as any,
                        },
                        {
                            name: 'system.user.delete',
                            path: '',
                            label: '删除',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 6,
                            rule: {
                                action: PermissionAction.DELETE,
                                subject: UserEntity,
                            } as any,
                        },
                        {
                            name: 'system.user.update',
                            path: '',
                            label: '更新',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 7,
                            rule: {
                                action: PermissionAction.UPDATE,
                                subject: UserEntity,
                            } as any,
                        },
                    ],
                },
                {
                    name: 'system.role',
                    path: '/system/role',
                    label: '角色管理',
                    description: '角色管理菜单',
                    status: Status.ENABLED,
                    type: PermissionType.MENU,
                    rule: {
                        action: PermissionAction.VISIT,
                        subject: RoleEntity,
                    } as any,
                    customOrder: 3,
                    children: [
                        {
                            name: 'system.role.list',
                            path: '',
                            label: '查看角色列表',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 8,
                            rule: {
                                action: PermissionAction.LIST,
                                subject: RoleEntity,
                            } as any,
                        },
                        {
                            name: 'system.role.create',
                            path: '',
                            label: '新增',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 8,
                            rule: {
                                action: PermissionAction.CREATE,
                                subject: RoleEntity,
                            } as any,
                        },
                        {
                            name: 'system.role.detail',
                            path: '',
                            label: '详情',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 9,
                            rule: {
                                action: PermissionAction.DETAIL,
                                subject: RoleEntity,
                            } as any,
                        },
                        {
                            name: 'system.role.delete',
                            path: '',
                            label: '删除',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 10,
                            rule: {
                                action: PermissionAction.DELETE,
                                subject: RoleEntity,
                            } as any,
                        },
                        {
                            name: 'system.user.update',
                            path: '',
                            label: '更新',
                            status: Status.ENABLED,
                            type: PermissionType.ACTION,
                            customOrder: 11,
                            rule: {
                                action: PermissionAction.UPDATE,
                                subject: UserEntity,
                            } as any,
                        },
                    ],
                },
            ],
        },
    ];

    constructor(
        protected dataSource: DataSource,
        protected configure: Configure,
    ) {}

    setOptions(options: AbilityOptions<A, C>) {
        if (!this.setuped) {
            this.options = options;
            this.setuped = true;
        }
        return this;
    }

    get roles() {
        return this._roles;
    }

    get permissions() {
        return this._permissions;
    }

    addRoles(data: Role[]) {
        this._roles = [...this.roles, ...data];
    }

    addPermissions(data: ResourceType<A, C>[]) {
        this._permissions = [...this.permissions, ...data].map((item) => {
            let subject: typeof item.rule.subject;
            if (!item.rule) return { ...item };
            if (isArray(item.rule.subject)) subject = item.rule.subject.map((v) => getSubject(v));
            else subject = getSubject(item.rule.subject);
            // 此处在于将subject转换成字符串
            const rule = { ...item.rule, subject };
            return { ...item, rule };
        });
    }

    async onApplicationBootstrap() {
        if (!this.dataSource.isInitialized) return null;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.syncRoles(queryRunner.manager);
            await this.syncPermissions(queryRunner.manager);
            await this.syncSuperAdmin(queryRunner.manager);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
        return true;
    }

    /**
     * 同步系统角色
     * @param manager
     */
    async syncRoles(manager: EntityManager) {
        this._roles = this.roles.reduce((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                // 同名角色进行合并
                return o.map((e) => (e.name === n.name ? deepMerge(e, n, 'merge') : e));
            }
            return [...o, n];
        }, []);
        for (const item of this.roles) {
            let role = await manager.findOne(RoleEntity, {
                relations: ['resources'],
                where: {
                    name: item.name,
                },
            });

            // 角色不存在则创建
            if (isNil(role)) {
                role = await manager.save(
                    manager.create(RoleEntity, {
                        name: item.name,
                        label: item.label,
                        systemed: true,
                    }),
                    {
                        reload: true,
                    },
                );
            } else {
                await manager.update(RoleEntity, role.id, { systemed: true });
            }
        }

        try {
            const systemRoles = await manager.findBy(RoleEntity, { systemed: true });
            const toDels: string[] = [];
            for (const sRole of systemRoles) {
                if (isNil(this.roles.find(({ name }) => sRole.name === name)))
                    toDels.push(sRole.id);
            }
            if (toDels.length > 0) await manager.delete(RoleEntity, toDels);
        } catch (err) {
            console.log('err ', err);
        }
        // 清理已经不存在的系统角色
    }

    /**
     * 同步权限
     * @param manager
     */
    async syncPermissions(manager: EntityManager) {
        const permissions = await manager.find(ResourceEntity);
        // 除超级管理员的所有角色
        const roles = await manager.find(RoleEntity, {
            relations: ['resources'],
            where: { name: Not(SystemRoles.SUPER_ADMIN), systemed: true },
        });
        const roleRepo = manager.getRepository(RoleEntity);

        this._permissions = this.flatPermissions(this._permissions);
        this._permissions =
            // 合并并去除重复权限
            this._permissions = this.permissions.reduce(
                (o, n) => (o.map(({ name }) => name).includes(n.name) ? o : [...o, n]),
                [],
            );
        const names = this.permissions.map(({ name }) => name);

        /** *********** 先同步权限到数据库中  ************ */
        for (const item of this.permissions) {
            const permission = omit(item, ['conditions']);
            const old = await manager.findOneBy(ResourceEntity, {
                name: permission.name,
            });
            if (isNil(old)) {
                await manager.save(
                    manager.create(ResourceEntity, {
                        ...omit(permission, ['parent', 'children']),
                        parent: !isNil(permission.parent)
                            ? await manager.findOneBy(ResourceEntity, {
                                  name: permission.parent,
                              })
                            : null,
                    }),
                );
            } else {
                await manager.update(ResourceEntity, old.id, {
                    ...omit(permission, ['parent', 'children']),
                    parent: !isNil(permission.parent)
                        ? await manager.findOneBy(ResourceEntity, {
                              name: permission.parent,
                          })
                        : null,
                });
            }
        }
        // 删除不存在的系统权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'manage-all') toDels.push(item.id);
        }
        if (toDels.length > 0) await manager.delete(ResourceEntity, toDels);
        /** *********** 同步普通角色  ************ */
        for (const role of roles) {
            // 新绑定的权限

            const rolePermissions = await manager.findBy(ResourceEntity, {
                name: In(this.roles.find(({ name }) => name === role.name).resources),
            });
            await roleRepo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'resources')
                .of(role)
                .addAndRemove(
                    rolePermissions.map(({ id }) => id),
                    (role.resources ?? []).map(({ id }) => id),
                );
        }

        /** *********** 同步超级管理员角色  ************ */

        // 查询出超级管理员角色
        const superRole = await manager.findOneOrFail(RoleEntity, {
            relations: ['resources'],
            where: { name: SystemRoles.SUPER_ADMIN },
        });

        const systemManage = await manager.findOneOrFail(ResourceEntity, {
            where: { name: 'manage-all' },
        });

        // 添加系统管理权限到超级管理员角色
        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'resources')
            .of(superRole)
            .addAndRemove(
                [systemManage.id],
                (superRole.resources ?? []).map(({ id }) => id),
            );
    }

    private resolvePermissions(
        permission: ResourceType<A, C>,
        flatList: ResourceType<A, C>[],
        parent?: ResourceType<A, C>,
    ) {
        const flatPermission = {
            ...permission,
            parent: parent ? parent.name : undefined, // 只保留父权限的名称或其他标识信息
        };
        flatList.push(flatPermission);

        if (permission.children && permission.children.length) {
            permission.children.forEach((child) => {
                this.resolvePermissions(child, flatList, flatPermission);
            });
        }
    }

    private flatPermissions(permissions: ResourceType<A, C>[]) {
        const flatList: ResourceType<A, C>[] = [];
        permissions.forEach((permission) => {
            this.resolvePermissions(permission, flatList);
        });
        return flatList;
    }

    /**
     * 同步超级管理员
     * @param manager
     */
    async syncSuperAdmin(manager: EntityManager) {
        const superRole = await manager.findOneOrFail(RoleEntity, {
            relations: ['resources'],
            where: { name: SystemRoles.SUPER_ADMIN },
        });
        const adminConf = await this.configure.get<UserModuleConfig['super']>('user.super');
        const superAdmin = await manager.findOne(UserEntity, {
            where: {
                name: adminConf.name,
            },
            relations: ['roles'],
        });

        if (!isNil(superAdmin)) {
            const userRepo = manager.getRepository(UserEntity);

            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(superAdmin)
                .addAndRemove(
                    [superRole.id],
                    ((superAdmin.roles ?? []) as RoleEntity[]).map(({ id }) => id),
                );
        }
    }
}
