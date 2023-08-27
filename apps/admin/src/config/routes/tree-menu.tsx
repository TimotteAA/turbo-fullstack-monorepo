import { redirect } from 'react-router';

import { RouteOption } from '@/components/router/types';

import AccountIcon from '~icons/mdi/account';

export const treeMenu: RouteOption = {
    id: 'menu',
    path: 'menu',
    meta: { name: '嵌套菜单-1', icon: AccountIcon },
    children: [
        {
            id: 'menu.index',
            menu: false,
            index: true,
            loader: () => redirect('/menu/menu1'),
        },
        {
            id: 'menu.menu1',
            menu: true,
            path: 'menu1',
            meta: { name: '菜单菜单-1-1' },
            children: [
                {
                    id: 'menu.menu1.menu1',
                    menu: true,
                    path: 'menu1',
                    meta: { name: '菜单菜单-1-1-1' },
                    page: 'account/center/index',
                    children: [
                        {
                            id: 'menu.menu1.menu1.menu1',
                            menu: true,
                            path: 'menu1',
                            meta: { name: '菜单菜单-1-1-1-1' },
                            page: 'account/center/index',
                        },
                    ],
                },
                {
                    id: 'menu.menu1.menu2',
                    menu: true,
                    path: 'menu2',
                    page: 'account/center/index',
                    meta: { name: '菜单菜单-1-1-2' },
                },
                {
                    id: 'menu.menu1.menu3',
                    menu: true,
                    path: 'menu3',
                    page: 'account/center/index',
                    meta: { name: '菜单菜单-1-1-3' },
                },
            ],
        },
        {
            id: 'menu.menu2',
            menu: true,
            path: 'menu2',
            meta: { name: '菜单菜单-1-2' },
            page: 'account/center/index',
        },
    ],
};
