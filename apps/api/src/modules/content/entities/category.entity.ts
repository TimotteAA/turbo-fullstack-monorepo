import { Column, Entity, OneToMany, Relation, Tree, TreeChildren, TreeParent } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { PostEntity } from './post.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Tree('materialized-path')
@Entity('content_categories')
export class CategoryEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '分类名称', nullable: false })
    name: string;

    @Expose({ groups: ['category-tree', 'category-list', 'category-detail'] })
    @Column({ comment: '自定义排序字段', default: 0 })
    customOrder: number;

    /**
     * 一个分类下有很多文章，一个文章只能有一个分类
     */
    @OneToMany(() => PostEntity, (post) => post.category, {
        // category被删除，posts也被删除
        cascade: true,
    })
    posts: Relation<PostEntity[]>;

    @Expose({ groups: ['category-detail', 'category-list'] })
    // 父分类被删除时，啥都不做
    @TreeParent({ onDelete: 'NO ACTION' })
    parent: Relation<CategoryEntity | null>;

    @Expose({ groups: ['category-tree'] })
    @TreeChildren({ cascade: true })
    children: Relation<CategoryEntity[]>;

    @Expose({ groups: ['category-list'] })
    depth = 0;
}
