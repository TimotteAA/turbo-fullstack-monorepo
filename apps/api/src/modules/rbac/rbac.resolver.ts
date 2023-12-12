import { AbilityOptions, AbilityTuple, MongoQuery, SubjectType } from '@casl/ability';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { isNil, omit, isArray } from 'lodash';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import { Configure } from '../config/configure';
import { deepMerge } from '../config/utils';

import { SystemRoles } from './constants';
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
            name: 'system-manage',
            label: '系统管理',
            description: '管理系统的所有功能',
            rule: {
                action: 'manage',
                subject: 'all',
            } as any,
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
            // await this.syncSuperAdmin(queryRunner.manager);
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

        // 清理已经不存在的系统角色
        const systemRoles = await manager.findBy(RoleEntity, { systemed: true });
        const toDels: string[] = [];
        for (const sRole of systemRoles) {
            if (isNil(this.roles.find(({ name }) => sRole.name === name))) toDels.push(sRole.id);
        }
        if (toDels.length > 0) await manager.delete(RoleEntity, toDels);
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
            where: { name: Not(SystemRoles.SUPER_ADMIN) },
        });
        const roleRepo = manager.getRepository(RoleEntity);
        // 合并并去除重复权限
        this._permissions = this.permissions.reduce(
            (o, n) => (o.map(({ name }) => name).includes(n.name) ? o : [...o, n]),
            [],
        );
        const names = this.permissions.map(({ name }) => name);

        /** *********** 先同步权限  ************ */

        for (const item of this.permissions) {
            const permission = omit(item, ['conditions']);
            const old = await manager.findOneBy(ResourceEntity, {
                name: permission.name,
            });
            if (isNil(old)) {
                await manager.save(manager.create(ResourceEntity, permission));
            } else {
                await manager.update(ResourceEntity, old.id, permission);
            }
        }

        // 删除不存在的系统权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'system-manage') toDels.push(item.id);
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
                .relation(RoleEntity, 'permissions')
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
            where: { name: 'system-manage' },
        });
        // 添加系统管理权限到超级管理员角色
        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'permissions')
            .of(superRole)
            .addAndRemove(
                [systemManage.id],
                (superRole.resources ?? []).map(({ id }) => id),
            );
    }

    // /**
    //  * 同步超级管理员
    //  * @param manager
    //  */
    // async syncSuperAdmin(manager: EntityManager) {
    //     const superRole = await manager.findOneOrFail(RoleEntity, {
    //         relations: ['permissions'],
    //         where: { name: SystemRoles.SUPER_ADMIN },
    //     });

    //     const superUsers = await manager
    //         .createQueryBuilder(UserEntity, 'user')
    //         .leftJoinAndSelect('user.roles', 'roles')
    //         .where('roles.id IN (:...ids)', { ids: [superRole.id] })
    //         .getMany();
    //     if (superUsers.length < 1) {
    //         const userRepo = manager.getRepository(UserEntity);
    //         if ((await userRepo.count()) < 1) {
    //             throw new InternalServerErrorException(
    //                 'Please add a super-admin user first before run server!',
    //             );
    //         }
    //         const firstUser = await userRepo.findOneByOrFail({ id: undefined });
    //         await userRepo
    //             .createQueryBuilder('user')
    //             .relation(UserEntity, 'roles')
    //             .of(firstUser)
    //             .addAndRemove(
    //                 [superRole.id],
    //                 ((firstUser.roles ?? []) as RoleEntity[]).map(({ id }) => id),
    //             );
    //     }
    // }
}
