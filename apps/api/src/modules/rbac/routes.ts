import { RouteOption, TagOption } from '../restful/types';

import * as rbacManageControllersMaps from './controllers';

export const createRbacApi = () => {
    const tags: Record<'manage', TagOption[]> = {
        manage: [
            { name: 'rbac角色管理', description: '对角色的CRUD操作' },
            { name: 'rbac部门管理', description: '对部门的CRUD操作' },
            { name: 'rbac资源管理', description: '对资源的crud操作' },
        ],
    };

    const routes: Record<'manage', RouteOption[]> = {
        manage: [
            {
                name: 'app.system',
                path: '/system',
                controllers: [...Object.values(rbacManageControllersMaps)],
            },
        ],
    };

    return { tags, routes };
};
