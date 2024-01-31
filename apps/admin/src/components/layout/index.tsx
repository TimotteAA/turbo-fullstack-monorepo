import React, { ReactNode, memo, useEffect } from 'react';
import { useLocation } from 'react-router';

import { useResponsiveMobileCheck } from '@/utils/hooks';

import { useRouterStore } from '../router/hooks';

import ClassicLayout from './classic.layout';
import { ConfigDrawer } from './components/drawer';

import { DrawerProvider } from '@/hooks/useDrawer';
import { LayoutActionType } from './constants';
import EmbedLayout from './embed.layout';
import { useLayout } from './hooks';
import { LayoutStore } from './store';
import TopLayout from './top.layout';
import { getMenuData } from './utils';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const dispatch = LayoutStore((state) => state.dispatch);
    // 根据路由推算出的菜单数据
    const { menus } = useRouterStore();
    const { mode } = useLayout();
    const isMobile = useResponsiveMobileCheck();
    // 主要是根据路由的改变，计算menu里的select、opens，即选择中的一个子树的菜单
    useEffect(() => {
        if (!isMobile) {
            dispatch({
                type: LayoutActionType.CHANGE_MENU,
                value: getMenuData(menus, location, mode),
            });
        }
    }, [mode, menus, location, isMobile]);

    // classic模式的sidebar是否折叠
    useEffect(() => {
        if (isMobile) {
            dispatch({
                type: LayoutActionType.CHANGE_COLLAPSE,
                value: true,
            });
        } else {
            dispatch({
                type: LayoutActionType.CHANGE_COLLAPSE,
                value: false,
            });
        }
    }, [isMobile]);

    return (
        <ConfigDrawer>
            <DrawerProvider>
                {mode === 'side' ? <ClassicLayout>{children}</ClassicLayout> : null}
                {mode === 'top' ? <TopLayout>{children}</TopLayout> : null}
                {mode === 'embed' ? <EmbedLayout>{children}</EmbedLayout> : null}
            </DrawerProvider>
        </ConfigDrawer>
    );
};
export default memo(MasterLayout);
