import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { Status } from '../constants';

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

    @Expose()
    @Column({ type: 'varchar', default: Status.ENABLED, comment: '资源状态' })
    status: Status;

    // 父亲被删了，我也die了
    // null表示顶级部门
    @Expose({ groups: ['system-list', 'system-detail'] })
    @TreeParent({ onDelete: 'CASCADE' })
    parent: Relation<SystemEntity | null>;

    @Expose({ groups: ['system-tree'] })
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
