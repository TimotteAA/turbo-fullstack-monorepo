import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { Status } from '../constants';

import { SystemEntity } from '.';

@Entity('rbac_roles')
export class RoleEntity extends BaseEntity {
    @Column({ comment: '角色名称', nullable: false })
    name!: string;

    @Column({ comment: '角色描述', nullable: true })
    description?: string;

    @ManyToOne(() => SystemEntity, (s) => s.roles, {
        onDelete: 'CASCADE',
    })
    system!: Relation<SystemEntity>;

    @Column({ type: 'varchar', comment: '角色状态', default: Status.ENABLED })
    status: Status;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
