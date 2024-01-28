import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { Menu, MenuProps } from 'antd';
import {
    ItemType,
    MenuDividerType,
    MenuItemGroupType,
    SubMenuType,
} from 'antd/es/menu/hooks/useItems';
import { isNil, isString } from 'lodash';
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '@/components/icon/Icon';
import { RouteOption } from '@/components/router/types';
import { isUrl } from '@/utils';
import { useResponsive } from '@/utils/hooks';

import { useLayout } from '../hooks';
import { LayoutMenuState } from '../types';

import { ThemeMode } from '../../theme/constants';

/**
 * 对路由项中的某个item处理成组件
 *
 * @param {RouteOption} menu 菜单项
 * @returns
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
        // 处理路径
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

/**
 * 用于侧边栏或者header页面跳转
 *
 * @param param0
 * @returns
 */
export const SideMenu: FC<{
    mode?: MenuProps['mode'];
    theme: `${ThemeMode}`;
    menu: LayoutMenuState;
}> = ({ mode = 'inline', theme, menu }) => {
    // 侧边栏是否折叠
    const { collapsed } = useLayout();
    // 是否处于移动端下
    const { isMobile } = useResponsive();
    // 之前的，侧边栏打开的菜单项
    const ref = useRef<string[]>(mode !== 'horizontal' ? menu.opens : []);
    // 打开的菜单项
    const [opens, setOpens] = useState<string[] | undefined>(collapsed ? undefined : ref.current);
    const { run: changeOpens } = useDebounceFn((data: string[]) => setOpens(data), {
        wait: 50,
    });
    // 监听打开菜单的变化
    useUpdateEffect(() => {
        setOpens(menu.opens);
    }, [menu.opens]);
    // 不是水平模式，如果折叠，则设定opens为空，否则设定为上次没折叠下的菜单项
    useUpdateEffect(() => {
        if (mode !== 'horizontal') {
            collapsed ? setOpens(undefined) : changeOpens(ref.current);
        }
    }, [collapsed]);
    // 侧边栏在不折叠的情况下，保存新的打开的菜单
    useUpdateEffect(() => {
        if (!collapsed && !isNil(opens) && mode !== 'horizontal') ref.current = opens;
    }, [opens]);
    /**
     * 监听菜单项的打开与关闭
     */
    const onOpenChange = useCallback(
        (keys: string[]) => {
            if (mode === 'horizontal' || !opens) return;
            // 非水平模式，且非折叠，有打卡的菜单
            // key 是最新被用户展开的菜单项的 key,即opens数组中不存在
            const latest = keys.find((key) => opens?.indexOf(key) === -1);
            if (latest && menu.rootSubKeys.indexOf(latest) === -1) {
                // 打开非顶级菜单
                setOpens(keys);
            } else {
                // 打开的是顶级菜单，仅打开这一个
                setOpens(latest ? [latest] : []);
            }
        },
        [opens, mode, collapsed],
    );
    useUpdateEffect(() => {
        setOpens(menu.opens);
    }, [isMobile]);

    return (
        <div className="fixed-sidebar-content">
            <Menu
                inlineIndent={18}
                theme={theme}
                mode={mode}
                items={menu.data.map((item) => getMenuItem(item))}
                openKeys={mode !== 'horizontal' ? opens : undefined}
                selectedKeys={menu.selects}
                onOpenChange={onOpenChange}
            />
        </div>
    );
};

/**
 * 嵌入式菜单
 * @param param0
 * @returns
 */
export const EmbedMenu: FC<{ theme: `${ThemeMode}`; menu: LayoutMenuState }> = ({
    theme,
    menu,
}) => {
    return (
        <Menu
            theme={theme}
            mode="inline"
            selectedKeys={menu.split.selects}
            items={menu.split.data.map((item) => getMenuItem(item))}
        />
    );
};
