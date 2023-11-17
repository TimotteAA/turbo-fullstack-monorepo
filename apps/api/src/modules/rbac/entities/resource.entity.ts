import {
    Column,
    CreateDateColumn,
    Entity,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { ResourceType, Status } from '../constants';

@Tree('materialized-path')
@Entity('rbac_resources')
export class ResourceEntity extends BaseEntity {
    @Column({ comment: '资源名称', nullable: false })
    name!: string;

    @Column({ comment: '资源键', nullable: false })
    key!: string;

    @Column({ comment: '资源描述', nullable: true })
    description?: string;

    @Column({ type: 'varchar', comment: '资源状态', default: Status.ENABLED })
    status: Status;

    @Column({ type: 'enum', enum: ResourceType, default: ResourceType.MENU, comment: '资源类型' })
    type: ResourceType;

    @Column({ comment: '用于侧边栏展示icon', nullable: true })
    icon?: string;

    // 父亲被删了，我也die了
    // null表示顶级资源
    @TreeParent({ onDelete: 'CASCADE' })
    parent: Relation<ResourceEntity | null>;

    // cascade表示父被插入时，子如果未被插，则也插进去
    @TreeChildren({ cascade: true })
    children: Relation<ResourceEntity[]>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
