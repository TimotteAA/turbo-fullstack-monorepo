import { RouteOption, TagOption } from '../restful/types';

import * as userApiControllersMap from './controllers';
import * as userManageControllersMap from './controllers/manage';

export const createUserApi = () => {
    const tags: Record<'app' | 'manage', TagOption[]> = {
        app: [
            {
                name: '账户相关操作',
                description: '进行登陆、注册、退出登录等操作',
            },
            {
                name: '账户相关操作',
                description: '修改账户操作',
            },
        ],
        manage: [
            {
                name: '用户操作',
                description: '用户后台的CRUD操作',
            },
        ],
    };

    const routes: Record<'app' | 'manage', RouteOption[]> = {
        app: [
            {
                name: 'app.user',
                path: '/user',
                controllers: [...Object.values(userApiControllersMap)],
            },
        ],
        manage: [
            {
                name: 'manage.user',
                path: '/user',
                controllers: [...Object.values(userManageControllersMap)],
            },
        ],
    };

    return {
        routes,
        tags,
    };
};
