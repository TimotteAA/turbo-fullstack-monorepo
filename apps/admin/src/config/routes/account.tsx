import { redirect } from 'react-router';

import { RouteOption } from '@/components/router/types';

import AccountIcon from '~icons/mdi/account';

export const account: RouteOption = {
    id: 'account',
    menu: true,
    path: 'account',
    meta: { name: '账号设置', icon: AccountIcon },
    children: [
        {
            id: 'account.index',
            menu: false,
            index: true,
            loader: () => redirect('/account/list'),
        },
        {
            id: 'account.list',
            menu: true,
            path: 'list',
            page: 'account/center/index',
            meta: { name: '账号管理' },
        },
        {
            id: 'account.setting',
            menu: true,
            path: 'setting',
            page: 'account/setting/index',
            meta: { name: '账户中心' },
        },
    ],
};
