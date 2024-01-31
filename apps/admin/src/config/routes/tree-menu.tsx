import { redirect } from 'react-router';

import { RouteOption } from '@/components/router/types';

import AccountIcon from '~icons/mdi/account';

export const treeMenu: RouteOption = {
    id: 'menu',
    path: 'menu',
    meta: { name: 'Menu-1', icon: AccountIcon },
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
            meta: { name: 'Menu-1-1', icon: AccountIcon },
            children: [
                {
                    id: 'menu.menu1.menu1',
                    menu: true,
                    path: 'menu1',
                    meta: { name: 'Menu-1-1-1', icon: AccountIcon },
                    page: 'account/center/index',
                },
                {
                    id: 'menu.menu1.menu2',
                    menu: true,
                    path: 'menu2',
                    page: 'account/center/index',
                    meta: { name: 'Menu-1-1-2', icon: AccountIcon },
                },
                {
                    id: 'menu.menu1.menu3',
                    menu: true,
                    path: 'menu3',
                    page: 'account/center/index',
                    meta: { name: 'Menu-1-1-3', icon: AccountIcon },
                },
            ],
        },
        {
            id: 'menu.menu2',
            menu: true,
            path: 'menu2',
            meta: { name: 'Menu-1-2', icon: AccountIcon },
            page: 'account/center/index',
        },
    ],
};
