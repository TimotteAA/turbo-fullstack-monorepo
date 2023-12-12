import { AbilityTuple, MongoQuery, RawRuleFrom } from '@casl/ability';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { ResourceType, Status } from '../constants';

import { RoleEntity } from './role.entity';

@Tree('materialized-path')
@Entity('rbac_resources')
export class ResourceEntity<
    A extends AbilityTuple = AbilityTuple,
    C extends MongoQuery = MongoQuery,
> extends BaseEntity {
    @Column({ comment: '资源名称', nullable: false })
    name!: string;

    @Column({ comment: '资源显示名称', nullable: true })
    label?: string;

    @Column({ comment: '资源描述', nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: ResourceType, default: ResourceType.MENU, comment: '资源类型' })
    type: ResourceType;

    @Column({ comment: '用于侧边栏展示icon', nullable: true })
    icon?: string;

    @Column({ comment: '菜单项路由路径', nullable: true })
    path?: string;

    @Column({ comment: '目录、菜单对应前端组件地址', nullable: true })
    component?: string;

    @Column({ type: 'varchar', comment: '资源状态', default: Status.ENABLED })
    status: Status;

    @Column({ type: 'boolean', comment: '是否外链', default: false, nullable: true })
    external?: boolean;

    @Column({
        type: 'boolean',
        comment: '是否显示在侧边栏中，用于目录或者菜单',
        default: true,
        nullable: true,
    })
    show?: boolean;

    @Column({ type: 'boolean', comment: '是否缓存，用于菜单项', default: true, nullable: true })
    keepAlive?: boolean;

    // 父亲被删了，我也die了
    // null表示顶级资源
    @TreeParent({ onDelete: 'CASCADE' })
    parent?: Relation<ResourceEntity | null>;

    // cascade表示父被插入时，子如果未被插，则也插进去
    @TreeChildren({ cascade: true })
    children: Relation<ResourceEntity[]>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ comment: '权限标识', nullable: true })
    permission?: string;

    /** **************************************角色的关联关系 */
    @ManyToMany(() => RoleEntity, (role) => role.resources)
    roles: Relation<RoleEntity[]>;

    @Column({ comment: '具体的权限规则', type: 'simple-json' })
    rule?: Omit<RawRuleFrom<A, C>, 'conditions'>;
}
