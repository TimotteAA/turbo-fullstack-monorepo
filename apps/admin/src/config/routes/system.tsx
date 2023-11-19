import { redirect } from 'react-router';

import { RouteOption } from '@/components/router/types';

import AccountIcon from '~icons/mdi/account';

export const system: RouteOption = {
    id: 'system',
    menu: true,
    path: 'system',
    meta: { name: '系统管理', icon: AccountIcon },
    children: [
        {
            id: 'system.index',
            menu: false,
            index: true,
            loader: () => redirect('/system/department'),
        },
        {
            id: 'system.department',
            menu: true,
            path: 'department',
            page: 'system/department/index',
            meta: { name: '部门管理' },
        },
        {
            id: 'system.role',
            menu: true,
            path: 'role',
            page: 'system/role/index',
            meta: { name: '角色管理' },
        },
        {
            id: 'system.resource',
            menu: true,
            path: 'resource',
            page: 'system/resource/index',
            meta: { name: '资源管理' },
        },
    ],
};
