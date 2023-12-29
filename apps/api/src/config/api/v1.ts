import { Configure } from '@/modules/config/configure';
import { createContentApi } from '@/modules/content/routes';
import { createRbacApi } from '@/modules/rbac/routes';
import { VersionOption } from '@/modules/restful/types';
import { createTaskApi } from '@/modules/task/routes';
import { createUserApi } from '@/modules/user/routes';

/**
 * 此次路由中的doc为总的路由doc
 * @param _configure
 */
export const v1 = async (_configure: Configure): Promise<VersionOption> => {
    const user = createUserApi();
    const content = createContentApi();
    const rbac = createRbacApi();
    const task = createTaskApi();

    return {
        title: 'Nest+React无头cms管理系统',
        routes: [
            {
                name: 'app',
                path: '/',
                doc: {
                    title: '应用接口',
                    description: '前端APP应用接口',
                    tags: [...content.tags.app, ...user.tags.app],
                },
                controllers: [],
                children: [...content.routes.app, ...user.routes.app],
            },
            {
                name: 'manage',
                path: '/manage',
                doc: {
                    title: '后台管理接口',
                    description: '后台管理接口',
                    tags: [
                        ...content.tags.manage,
                        ...user.tags.manage,
                        ...rbac.tags.manage,
                        ...task.tags.manage,
                    ],
                },
                controllers: [],
                children: [
                    ...content.routes.manage,
                    ...user.routes.manage,
                    ...rbac.routes.manage,
                    ...task.routes.manage,
                ],
            },
        ],
    };
};
