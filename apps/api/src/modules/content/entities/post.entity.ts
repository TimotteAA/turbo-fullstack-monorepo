import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { PostBodyType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';

/**
 * 文章模型
 */
@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '文章标题' })
    @Index({ fulltext: true })
    title: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'text' })
    @Index({ fulltext: true })
    body: string;

    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    @Index({ fulltext: true })
    summary?: string;

    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({
        comment: '文章类型',
        // type: 'enum', slite3不支持
        type: 'varchar',

        default: PostBodyType.MD,
    })
    type: PostBodyType;

    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    @Expose()
    @Column({ comment: '自定义文章排序', default: 0 })
    customOrder: number;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    /** 软删除字段 */
    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;

    @Expose()
    @ManyToOne(() => CategoryEntity, (c) => c.posts, {
        // 可以为空
        nullable: true,
        // 分类被删除时，文章无分类
        onDelete: 'SET NULL',
    })
    category: Relation<CategoryEntity> | null;

    @Expose()
    @ManyToMany(() => TagEntity, (tag) => tag.posts, {
        // 新的文章被插入时，如果没有tag则创建到数据库
        cascade: true,
    })
    @JoinTable()
    tags: Relation<TagEntity[]>;

    @OneToMany(() => CommentEntity, (c) => c.post, {
        cascade: true,
    })
    comments: Relation<CommentEntity[]>;

    @Expose()
    // 查询时的映射字段
    commentCount: number;
}
