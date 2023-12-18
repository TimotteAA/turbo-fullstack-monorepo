import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { ResourceEntity, RoleEntity } from '@/modules/rbac/entities';
import type { Route } from '@/modules/rbac/types';

/**
 * 用户entity、考虑普通注册、手机注册、邮箱注册、github oauth2注册
 */
@Exclude()
@Entity('users')
export class UserEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '用户名称', type: 'varchar', length: '100' })
    name!: string;

    @Expose()
    @Column({ comment: '用户昵称', nullable: true, type: 'varchar', length: '100' })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户邮箱', nullable: true })
    email?: string;

    @Expose()
    @Column({ comment: '用户手机号', nullable: true })
    phone?: string;

    @Column({ comment: '用户密码' })
    password!: string;

    @Expose()
    @Column({ comment: '用户简介', type: 'varchar', length: '300', nullable: true })
    summary?: string;

    // @ManyToOne(() => SystemEntity, (s) => s.users)
    // department?: Relation<SystemEntity> | null;

    @Expose()
    @CreateDateColumn()
    createtAt!: Date;

    @Expose()
    @UpdateDateColumn()
    updatedAt!: Date;

    /** 软删除字段 */
    @Expose()
    @DeleteDateColumn()
    deletedAt!: Date;

    @Column({ comment: '用户是否启用', default: true })
    actived?: boolean;

    /** **************************用户表的关联关系 */
    @Expose({ groups: ['user-detail'] })
    @ManyToMany(() => RoleEntity, (role) => role.users)
    roles: Relation<RoleEntity[]>;

    @ManyToMany(() => ResourceEntity, (permission) => permission.users)
    permissions: Relation<ResourceEntity[]>;

    /** 用户菜单的虚拟字段 */
    @Expose({ groups: ['user-detail'] })
    menus: Route[];

    @Expose({ groups: ['user-detail'] })
    @Expose()
    /** 用户权限码 */
    permissionCodes: string[];
}
