import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, Index, ManyToMany } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { PostEntity } from './post.entity';

@Exclude()
@Entity('content_tags')
export class TagEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '标签名称', nullable: false })
    @Index({ fulltext: true })
    name: string;

    @Expose()
    @Column({ comment: '标签描述', nullable: true })
    description?: string;

    @Expose({ groups: ['tag-detail'] })
    @ManyToMany(() => PostEntity, (post) => post.tags)
    posts: Relation<PostEntity>;

    @Expose()
    @Column({ comment: '自定义排序字段', default: 0 })
    customOrder: number;

    /**
     * 通过queryBuilder生成的文章数量(虚拟字段)
     */
    @Expose()
    postCount: number;
}
