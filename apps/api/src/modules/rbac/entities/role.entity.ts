import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { UserEntity } from '@/modules/user/entities';

import { Status } from '../constants';

import { ResourceEntity } from '.';

@Entity('rbac_roles')
export class RoleEntity extends BaseEntity {
    @Column({ comment: '角色名称', nullable: false })
    name!: string;

    @Column({ comment: '角色显示名称', nullable: true })
    label?: string;

    @Column({ comment: '角色描述', nullable: true })
    description?: string;

    @Column({ comment: '是否为系统角色', default: false })
    systemed?: boolean;

    @Column({ type: 'varchar', comment: '角色状态', default: Status.ENABLED })
    status: Status;

    @Column({ comment: '角色排序字段', default: 0 })
    customOrder: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    /** **************************************角色的关联关系 */
    @ManyToMany(() => ResourceEntity, (resource) => resource.roles, {
        cascade: true,
        eager: true,
    })
    resources: Relation<ResourceEntity[]>;

    @ManyToMany(() => UserEntity, (user) => user.roles)
    @JoinTable()
    users: Relation<UserEntity[]>;
}
