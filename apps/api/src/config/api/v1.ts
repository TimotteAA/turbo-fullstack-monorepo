import { Configure } from '@/modules/config/configure';
import * as contentControllerMaps from '@/modules/content/controllers';
import * as rbacControllerMaps from '@/modules/rbac/controllers';
import { VersionOption } from '@/modules/restful/types';
import * as userControllerMaps from '@/modules/user/controllers';

/**
 * 此次路由中的doc为总的路由doc
 * @param _configure
 */
export const v1 = async (_configure: Configure): Promise<VersionOption> => {
    return {
        title: '草泥马',
        routes: [
            {
                name: 'app',
                path: '/',
                doc: {
                    title: '应用接口',
                    description: '前端APP应用接口',
                    tags: [
                        { name: '分类操作', description: '对分类的增删查操作' },
                        { name: '标签操作', description: '对标签的增删查操作' },
                        { name: '文章操作', description: '对文章进行的增删查改及搜索等操作' },
                        { name: '评论操作', description: '对评论的增删查操作' },
                        { name: '用户操作', description: '对用户的CRUD操作' },
                        { name: 'rbac角色管理', description: '对角色的CRUD操作' },
                        { name: 'rbac系统管理', description: '对系统的CRUD操作' },
                        { name: 'rbac资源管理', description: '对资源的crud操作' },
                    ],
                },
                controllers: [],
                children: [
                    {
                        name: 'content',
                        path: '/content',
                        controllers: [...Object.values(contentControllerMaps)],
                    },
                    {
                        name: 'user',
                        path: '/user',
                        controllers: [...Object.values(userControllerMaps)],
                    },
                    {
                        name: 'rbac',
                        path: '/rbac',
                        controllers: [...Object.values(rbacControllerMaps)],
                    },
                ],
            },
        ],
    };
};
