import {
    ItemType,
    MenuDividerType,
    MenuItemGroupType,
    SubMenuType,
} from 'antd/es/menu/hooks/useItems';
import { isNil, isString } from 'lodash';
import { Link } from 'react-router-dom';

import Icon from '@/components/icon/Icon';
import { RouteOption } from '@/components/router/types';
import { isUrl } from '@/utils';

/**
 * 把路由表中的某一项处理成antd Menu的item
 *
 * @param {RouteOption} menu 菜单项
 * @returns {ItemType}
 */
export const getMenuItem = (menu: RouteOption): ItemType => {
    const meta = menu.meta ?? {};
    const text = meta.name ?? menu.id ?? '';
    const item: ItemType = {
        key: menu.id,
    };
    // 分割线
    if (menu.divide) {
        return {
            ...item,
            type: 'divider',
        } as MenuDividerType;
    }
    if (menu.onlyGroup) {
        // 分组项
        (item as MenuItemGroupType).type = 'group';
        (item as MenuItemGroupType).label = text;
    } else {
        // 处理Icon
        if (!isNil(meta.icon)) {
            (item as any).icon = isString(meta.icon) ? (
                <Icon name={meta.icon as any} />
            ) : (
                <Icon component={meta.icon} style={{ fontSize: '0.875rem' }} />
            );
        }
        // 处理外链
        if (!isNil(menu.path)) {
            if (!menu.children?.length) {
                item.label = isUrl(menu.path) ? (
                    // 外链
                    <a href={menu.path} target={meta.target ?? '_blank'}>
                        {text}
                    </a>
                ) : (
                    // react-router link路由跳转
                    <Link to={menu.path}>{text}</Link>
                );
            } else {
                item.label = text;
            }
        }
    }
    if (menu.children?.length) {
        (item as SubMenuType | MenuItemGroupType).children = menu.children.map((child) =>
            getMenuItem(child),
        );
    }
    return item;
};
