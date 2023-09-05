import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    Relation,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { PostEntity } from './post.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Tree('materialized-path')
@Entity('content_comments')
export class CommentEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '评论内容', nullable: false })
    body: string;

    @Expose()
    @CreateDateColumn({
        comment: '评论发表时间',
    })
    createdAt: Date;

    @Expose()
    @ManyToOne(() => PostEntity, (post) => post.comments, {
        // 文章不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post: Relation<PostEntity>;

    @Column({ comment: '自定义排序字段', default: 0 })
    customOrder: number;

    // 父评论被删了，子评论也宰了
    @TreeParent({ onDelete: 'CASCADE' })
    parent: Relation<CommentEntity | null>;

    @Expose()
    // 子评论插入时，如果父评论不存在，也插进去
    @TreeChildren({ cascade: true })
    children: Relation<CommentEntity[]>;

    @Expose()
    depth = 0;
}
