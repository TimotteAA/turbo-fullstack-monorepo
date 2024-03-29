import { IConfig } from '../types';

import { account } from './routes/account';
import { content } from './routes/content';
import { dashboard } from './routes/dashboard';
import { errors } from './routes/errors';
import { home } from './routes/home';
import { addLoading } from './routes/loading';
import { media } from './routes/media';
import { outer } from './routes/outer';
import { setting } from './routes/setting';
import { system } from './routes/system';

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
                id: 'layout.master',
                menu: false,
                path: '/',
                page: 'layouts/master',
                error: 'errors/404',
                children: addLoading([
                    home,
                    dashboard,
                    account,
                    content,
                    media,
                    setting,
                    treeMenu,
                    system,
                    outer,
                ]),
            },
            errors,
        ],
    },
});
