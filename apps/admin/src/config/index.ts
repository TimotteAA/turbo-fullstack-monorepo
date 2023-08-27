import { IConfig } from '../types';

/** 各个模块路由表 */
import { account } from './routes/account';
import { content } from './routes/content';
import { dashboard } from './routes/dashboard';
import { errors } from './routes/errors';
import { home } from './routes/home';

import { addLoading } from './routes/loading';
import { media } from './routes/media';
import { setting } from './routes/setting';

// 嵌套菜单
import { treeMenu } from './routes/tree-menu';

export const config = (): IConfig => ({
    auth: { api: '/user/info' },
    router: {
        // basepath: import.meta.env.VITE_BASE_URL,
        basepath: '/',
        window: undefined,
        hash: false,
        routes: [
            {
                id: 'layout.masster',
                menu: false,
                path: '/',
                page: 'layouts/master',
                error: 'errors/404',
                children: addLoading([home, dashboard, account, content, media, setting, treeMenu]),
            },
            errors,
        ],
    },
});
