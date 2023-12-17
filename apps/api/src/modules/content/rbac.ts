import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { Status, ResourceType as PermissionType, SystemRoles } from '../rbac/constants';
import { RbacResolver } from '../rbac/rbac.resolver';

import { CategoryEntity, CommentEntity, PostEntity, TagEntity } from './entities';

@Injectable()
export class ContentRbac implements OnModuleInit {
    constructor(private readonly moduleRef: ModuleRef) {}

    onModuleInit() {
        const resolver = this.moduleRef.get(RbacResolver, { strict: false });

        resolver.addPermissions([
            {
                name: 'content',
                label: '内容模块管理',
                path: '/content',
                status: Status.ENABLED,
                type: PermissionType.DIRECTORY,
                customOrder: 12,
                children: [
                    {
                        name: 'content.post',
                        path: '/content/post',
                        label: '文章管理',
                        description: '文章管理菜单',
                        status: Status.DISABLED,
                        type: PermissionType.MENU,
                        customOrder: 13,
                        rule: {
                            action: 'list',
                            subject: PostEntity.name,
                        } as any,
                        children: [
                            {
                                name: 'content.post.create',
                                path: '',
                                label: '新增',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 17,
                                rule: {
                                    action: 'create',
                                    subject: PostEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.user.detail',
                                path: '',
                                label: '详情',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 18,
                                rule: {
                                    action: 'detail',
                                    subject: PostEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.post.delete',
                                path: '',
                                label: '删除',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 19,
                                rule: {
                                    action: 'delete',
                                    subject: PostEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.post.update',
                                path: '',
                                label: '更新',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 20,
                                rule: {
                                    action: 'update',
                                    subject: PostEntity.name,
                                } as any,
                            },
                        ],
                    },
                    {
                        name: 'content.tag',
                        path: '/content/tag',
                        label: '标签管理',
                        description: '标签管理菜单',
                        status: Status.ENABLED,
                        type: PermissionType.MENU,
                        rule: {
                            action: 'list',
                            subject: TagEntity.name,
                        } as any,
                        customOrder: 14,
                        children: [
                            {
                                name: 'content.tag.create',
                                path: '',
                                label: '新增',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 21,
                                rule: {
                                    action: 'create',
                                    subject: TagEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.tag.detail',
                                path: '',
                                label: '详情',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 22,
                                rule: {
                                    action: 'detail',
                                    subject: TagEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.tag.delete',
                                path: '',
                                label: '删除',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 23,
                                rule: {
                                    action: 'delete',
                                    subject: TagEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.tag.update',
                                path: '',
                                label: '更新',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 24,
                                rule: {
                                    action: 'update',
                                    subject: TagEntity.name,
                                } as any,
                            },
                        ],
                    },
                    {
                        name: 'content.comment',
                        path: '/content/comment',
                        label: '评论管理',
                        description: '评论管理菜单',
                        status: Status.ENABLED,
                        type: PermissionType.MENU,
                        rule: {
                            action: 'list',
                            subject: CommentEntity.name,
                        } as any,
                        customOrder: 15,
                        children: [
                            {
                                name: 'content.comment.create',
                                path: '',
                                label: '新增',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 25,
                                rule: {
                                    action: 'create',
                                    subject: CommentEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.comment.detail',
                                path: '',
                                label: '详情',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 26,
                                rule: {
                                    action: 'detail',
                                    subject: CommentEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.comment.delete',
                                path: '',
                                label: '删除',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 27,
                                rule: {
                                    action: 'delete',
                                    subject: CommentEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.comment.update',
                                path: '',
                                label: '更新',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 28,
                                rule: {
                                    action: 'update',
                                    subject: CommentEntity.name,
                                } as any,
                            },
                        ],
                    },
                    {
                        name: 'content.category',
                        path: '/content/category',
                        label: '分类管理',
                        description: '分类管理菜单',
                        status: Status.ENABLED,
                        type: PermissionType.MENU,
                        rule: {
                            action: 'list',
                            subject: CategoryEntity.name,
                        } as any,
                        customOrder: 16,
                        children: [
                            {
                                name: 'content.category.create',
                                path: '',
                                label: '新增',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 29,
                                rule: {
                                    action: 'create',
                                    subject: CategoryEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.category.detail',
                                path: '',
                                label: '详情',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 30,
                                rule: {
                                    action: 'detail',
                                    subject: CategoryEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.category.delete',
                                path: '',
                                label: '删除',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 31,
                                rule: {
                                    action: 'delete',
                                    subject: CategoryEntity.name,
                                } as any,
                            },
                            {
                                name: 'content.category.update',
                                path: '',
                                label: '更新',
                                status: Status.ENABLED,
                                type: PermissionType.ACTION,
                                customOrder: 32,
                                rule: {
                                    action: 'update',
                                    subject: CategoryEntity.name,
                                } as any,
                            },
                        ],
                    },
                ],
            },
            // 前台权限
            {
                name: 'post.create',
                rule: {
                    action: 'Create',
                    subject: PostEntity,
                },
                type: PermissionType.ACTION,
                status: Status.ENABLED,
                customOrder: 32,
            },
            {
                name: 'post.owner',
                rule: {
                    action: 'owner',
                    subject: PostEntity,
                    conditions: (user) => ({
                        'author.id': user.id,
                    }),
                },
                type: PermissionType.ACTION,
                status: Status.ENABLED,
                customOrder: 33,
            },
            {
                name: 'comment.create',
                rule: {
                    action: 'create',
                    subject: CommentEntity,
                },
                type: PermissionType.ACTION,
                status: Status.ENABLED,
                customOrder: 34,
            },
            {
                name: 'comment.owner',
                rule: {
                    action: 'owner',
                    subject: CommentEntity.name,
                    conditions: (user) => ({
                        'author.id': user.id,
                    }),
                },
                type: PermissionType.ACTION,
                status: Status.ENABLED,
                customOrder: 33,
            },
        ]);

        resolver.addRoles([
            {
                name: SystemRoles.USER,
                label: '普通用户',
                resources: ['post.create', 'post.owner', 'comment.create', 'comment.owner'],
            },
        ]);
    }
}
