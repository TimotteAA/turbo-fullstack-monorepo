import { Layout, Menu } from 'antd';
import React, { FC, ReactNode, memo, useEffect } from 'react';
import { useLocation } from 'react-router';

import { useResponsiveMobileCheck } from '@/utils/hooks';

import { useRouterStore } from '../router/hooks';

import ClassicLayout from './classic.layout';
import LayoutContent from './components/content';
import { ConfigDrawer } from './components/drawer';
import { LayoutHeader } from './components/header';
import { SideMenu, getMenuItem } from './components/menu';
import { LayoutActionType } from './constants';
import { useLayout } from './hooks';
import { LayoutStore } from './store';
import TopLayout from './top.layout';
import { getMenuData } from './utils';

const { Content, Sider } = Layout;

/**
 * embed模式布局
 * @param param0
 * @returns
 */
const EmbedLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { menu } = useLayout();
    console.log('menu ', menu);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed trigger={null}>
                <Menu
                    mode="inline"
                    selectedKeys={menu.split.selects}
                    items={menu.split.data.map((item) => getMenuItem(item))}
                />
            </Sider>
            <section className="layout-main">
                <Layout hasSider>
                    {/* <Sider>
                        <Menu
                            items={menu.data.map((item) => getMenuItem(item))}
                            selectedKeys={menu.selects}
                        />
                    </Sider> */}
                    <SideMenu menu={menu} theme="dark" />
                    <Layout>
                        <LayoutHeader />
                        <Content>
                            <LayoutContent>{children}</LayoutContent>
                        </Content>
                    </Layout>
                </Layout>
            </section>
        </Layout>
    );
};

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const dispatch = LayoutStore((state) => state.dispatch);
    // 根据路由推算出的菜单数据
    const { menus } = useRouterStore();
    const {
        mode,
        // menu: { opens, selects },
    } = useLayout();
    const isMobile = useResponsiveMobileCheck();
    // 主要是根据路由的改变，计算menu里的select、opens，即选择中的一个子树的菜单
    useEffect(() => {
        dispatch({
            type: LayoutActionType.CHANGE_MENU,
            value: getMenuData(menus, location, mode, isMobile),
        });
    }, [mode, menus, location, isMobile]);
    console.log('mode ', mode);
    return (
        <ConfigDrawer>
            {mode === 'side' && <ClassicLayout>{children}</ClassicLayout>}
            {mode === 'top' && <TopLayout>{children}</TopLayout>}
            {mode === 'embed' && <EmbedLayout>{children}</EmbedLayout>}
        </ConfigDrawer>
    );
};
export default memo(MasterLayout);
