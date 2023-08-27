import { Layout } from 'antd';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';

import { useLocation } from 'react-router';

import { useResponsiveMobileCheck } from '@/utils/hooks';

import KeepAlive from '../keepalive/views';
import { useRouterStore } from '../router/hooks';

import { ThemeStore } from '../theme/store';

import { ConfigDrawer } from './components/drawer';
import { LayoutHeader } from './components/header';
import { EmbedSidebar, Sidebar } from './components/sidebar';
import KeepAliveTabs from './components/tabs';
import { LayoutActionType, LayoutThemeContext, layoutDarkTheme } from './constants';
import { useLayout } from './hooks';
import { LayoutStore } from './store';

import $styles from './styles/index.module.css';
import { LayoutConfig, LayoutTheme } from './types';
import { getMenuData, getLayoutCssStyle, getLayoutClasses } from './utils';

/**
 * Layout的内容区域
 * @param param0
 * @returns
 */
const LayoutContent: FC<{ children?: ReactNode }> = ({ children }) => {
    return (
        <div className={$styles.layoutContent}>
            <div className={$styles.layoutTabs}>
                <KeepAliveTabs />
            </div>
            <div className={$styles.layoutKeepAliveContainer}>
                <KeepAlive>{children}</KeepAlive>
            </div>
        </div>
    );
};
/**
 * side模式布局
 *
 * @param param0
 * @returns
 */
const SideLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { Content } = Layout;
    return (
        <>
            <Sidebar />
            <Layout>
                <LayoutHeader />
                <Content>
                    <LayoutContent>{children}</LayoutContent>
                </Content>
            </Layout>
        </>
    );
};

/**
 * mode为content的布局
 *
 * @param param0
 * @returns
 */
const ContentLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { Content } = Layout;
    return (
        <>
            <LayoutHeader />
            <section className="layout-main">
                <Layout>
                    <Sidebar />
                    <Content>
                        <LayoutContent>{children}</LayoutContent>
                    </Content>
                </Layout>
            </section>
        </>
    );
};

/**
 * top模式的布局
 *
 * @param param0
 * @returns
 */
const TopLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { Content } = Layout;
    return (
        <>
            <LayoutHeader />
            <Content>
                <LayoutContent>{children}</LayoutContent>
            </Content>
        </>
    );
};

/**
 * embed模式布局
 * @param param0
 * @returns
 */
const EmbedLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { Content } = Layout;
    return (
        <>
            <Sidebar />
            <section className="layout-main">
                <Layout>
                    <EmbedSidebar />
                    <Layout>
                        <LayoutHeader />
                        <Content>
                            <LayoutContent>{children}</LayoutContent>
                        </Content>
                    </Layout>
                </Layout>
            </section>
        </>
    );
};

const LayoutThemeProvider: FC<{ children?: ReactNode }> = ({ children }) => {
    const layoutTheme = LayoutStore((state) => state.theme);
    const [theme, setTheme] = useState<LayoutTheme>(layoutTheme);
    const systemTheme = ThemeStore((state) => state.mode);
    useEffect(() => {
        setTheme(systemTheme === 'dark' ? layoutDarkTheme : layoutTheme);
    }, [layoutTheme, systemTheme]);
    return <LayoutThemeContext.Provider value={theme}>{children}</LayoutThemeContext.Provider>;
};

/**
 * 核心的MainLayout
 * 在其中，动态的计算打开的menu
 *
 * @param param0
 */
const LayoutWrapper: FC<LayoutConfig & { children?: ReactNode }> = ({ children }) => {
    const [classes, setClasses] = useState<string>('');
    const isMobile = useResponsiveMobileCheck();
    const { fixed, mode, styles } = useLayout();
    const location = useLocation();
    const dispatch = LayoutStore((state) => state.dispatch);
    const menus = useRouterStore.useMenus();
    useEffect(() => {
        setClasses(getLayoutClasses(fixed, mode, $styles, isMobile));
    }, [fixed, mode, isMobile]);
    useEffect(() => {
        dispatch({
            type: LayoutActionType.CHANGE_MENU,
            value: getMenuData(menus, location, mode, isMobile),
        });
    }, [mode, menus, location, isMobile]);
    const Main = useMemo(() => {
        if (!isMobile) {
            if (mode === 'top') return <TopLayout>{children}</TopLayout>;
            if (mode === 'content') return <ContentLayout>{children}</ContentLayout>;
            if (mode === 'embed') return <EmbedLayout>{children}</EmbedLayout>;
        }
        return <SideLayout>{children}</SideLayout>;
    }, [mode, isMobile]);

    return (
        <Layout className={classes} style={getLayoutCssStyle(styles)}>
            <LayoutThemeProvider>{Main}</LayoutThemeProvider>
        </Layout>
    );
};

const MainLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    return (
        <ConfigDrawer>
            <LayoutWrapper>{children}</LayoutWrapper>
        </ConfigDrawer>
    );
};
export default MainLayout;
