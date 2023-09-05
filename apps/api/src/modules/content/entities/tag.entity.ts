import { Column, Entity, ManyToMany, Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { PostEntity } from './post.entity';

@Entity('content_tags')
export class TagEntity extends BaseEntity {
    @Column({ comment: '标签名称', nullable: false })
    tag: string;

    @Column({ comment: '标签描述', nullable: true })
    description?: string;

    @ManyToMany(() => PostEntity, (post) => post.tags)
    posts: Relation<PostEntity>;

    @Column({ comment: '自定义排序字段', default: 0 })
    customOrder: number;
}
