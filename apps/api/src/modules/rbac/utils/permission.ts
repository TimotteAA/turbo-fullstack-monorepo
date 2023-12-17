import { ResourceType, Status } from '../constants';
import { ResourceEntity } from '../entities';
import type { Route } from '../types';

/**
 * 根据角色id连表后查询到的列表，构造菜单树
 */
export const generateRouters = (menus: ResourceEntity[]) => {
    return filterRoutes(menus, null);
};

const filterRoutes = (menus: ResourceEntity[], parent?: ResourceEntity) => {
    const res: Route[] = [];
    menus.forEach((menu) => {
        if (menu.type === ResourceType.ACTION || menu.status === Status.DISABLED) {
            // 权限或禁用
            return;
        }
        let route;
        if (!parent && !menu.parent && menu.type === ResourceType.MENU) {
            // 一级菜单
            route = createRoute(menu);
            // 目录
        } else if (!parent && !menu.parent && menu.type === ResourceType.DIRECTORY) {
            const childRoutes = filterRoutes(menus, menu);
            route = createRoute(menu);
            if (Array.isArray(childRoutes) && childRoutes.length > 0) {
                route.redirect = childRoutes[0].path;
                route.children = childRoutes;
            }
        } else if (parent && parent.id === menu?.parent?.id && menu.type === ResourceType.MENU) {
            // 子菜单
            const childRoutes = filterRoutes(menus, menu);
            route = createRoute(menu);
            if (Array.isArray(childRoutes) && childRoutes.length > 0) {
                route.redirect = childRoutes[0].path;
                route.children = childRoutes;
            }
        }
        if (route) {
            res.push(route);
        }
    });

    return res;
};

const createRoute = (menu: ResourceEntity): Route => {
    if (isExternal(menu.path) || menu.external) {
        // 外链用iframe
        return {
            id: menu.id,
            path: menu.path,
            component: 'iframe',
            name: menu.name,
            meta: {
                name: menu.name,
                icon: menu.icon,
                hide: menu.status === Status.DISABLED,
            },
        };
    }

    // 根目录
    if (menu.type === ResourceType.DIRECTORY) {
        return {
            id: menu.id,
            path: menu.path,
            component: menu.component,
            name: menu.name,
            meta: {
                name: menu.name,
                icon: menu.icon,
                hide: false,
            },
        };
    }

    return {
        id: menu.id,
        path: menu.path,
        name: menu.name,
        component: menu.component,
        meta: {
            name: menu.name,
            icon: menu.icon,
            ignoreKeepAlive: !menu.keepAlive,
            ...(!menu.show ? { hide: !menu.show } : null),
        },
    };
};

const isExternal = (path: string) => {
    const reg =
        /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    return reg.test(path);
};
