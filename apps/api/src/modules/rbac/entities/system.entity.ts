import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { Status } from '../constants';

import { RoleEntity } from './role.entity';

@Exclude()
@Tree('materialized-path')
@Entity('rbac_systems')
export class SystemEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '部门名称', nullable: false })
    @Index({ fulltext: true })
    name!: string;

    @Expose()
    @Column({ comment: '部门描述', nullable: true })
    @Index({ fulltext: true })
    description?: string;

    // @OneToMany(() => UserEntity, (user) => user.department, {
    //     cascade: true,
    // })
    // users: Relation<UserEntity[]>;

    @OneToMany(() => RoleEntity, (role) => role.system, {
        cascade: true,
    })
    roles: Relation<RoleEntity[]>;

    @Expose()
    @Column({ type: 'varchar', default: Status.ENABLED, comment: '资源状态' })
    status: Status;

    @Expose({ groups: ['system-list'] })
    // 父亲被删了，我也die了
    // null表示顶级部门
    @TreeParent({ onDelete: 'CASCADE' })
    parent: Relation<SystemEntity | null>;

    @Expose()
    // cascade表示父部门被插入时，子部门如果未被插，则也插进去
    @TreeChildren({ cascade: true })
    children: Relation<SystemEntity[]>;

    @Expose()
    @CreateDateColumn()
    createdAt!: Date;

    @Expose()
    @UpdateDateColumn()
    updatedAt!: Date;

    @Expose({ groups: ['system-list'] })
    depth = 0;
}
