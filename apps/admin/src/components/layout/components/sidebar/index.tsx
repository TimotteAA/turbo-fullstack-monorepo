import { useDebounceFn } from 'ahooks';
import { Drawer, Layout, theme as AntdTheme } from 'antd';
import { CollapseType } from 'antd/es/layout/Sider';
import { useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { useResponsiveMobileCheck } from '@/utils/hooks';

import { EmbedMenu, SideMenu } from '../menu';

import { useLayout, useLayoutAction, useLayoutTheme } from '../../hooks';

import { Logo } from './logo';

/**
 * 侧边栏组件
 *
 * @returns
 */
export const Sidebar = () => {
    const { Sider } = Layout;
    const isMobile = useResponsiveMobileCheck();
    const { mode, collapsed, styles: layoutStyles, mobileSide, menu } = useLayout();
    const theme = useLayoutTheme();
    const { changeCollapse, changeMobileSide } = useLayoutAction();
    const [collapse, setCollapse] = useState(collapsed);
    // 同步store中的collapsed
    useUpdateEffect(() => {
        setCollapse(collapsed);
    }, [collapsed]);
    const { run: onCollapse } = useDebounceFn(
        (_value: boolean, type: CollapseType) => {
            if (!isMobile && type === 'responsive') changeCollapse(true);
        },
        { wait: 100 },
    );
    // 移动端下侧边栏是个抽屉
    const closeDrawer = useCallback(() => changeMobileSide(false), []);
    const {
        token: { colorBgContainer },
    } = AntdTheme.useToken();
    // 根据theme设定的Side组件的颜色
    const styles = useMemo(
        () => (theme.sidebar !== 'dark' ? { background: colorBgContainer } : {}),
        [theme.sidebar],
    );
    if (!isMobile) {
        if (mode === 'top') return null;
        if (mode === 'embed') {
            return (
                <Sider
                    collapsible
                    collapsed
                    style={styles}
                    collapsedWidth={layoutStyles.sidebarCollapseWidth}
                    trigger={null}
                >
                    <EmbedMenu theme={theme.sidebar} menu={menu} />
                </Sider>
            );
        }
        // 侧边栏模式
        return (
            <Sider
                collapsible
                style={styles}
                collapsed={collapse}
                width={layoutStyles.sidebarWidth}
                // onBreakpoint={onBreakpoint}
                collapsedWidth={layoutStyles.sidebarCollapseWidth}
                breakpoint="lg"
                onCollapse={onCollapse}
                trigger={null}
            >
                {mode !== 'content' ? <Logo /> : null}
                <SideMenu theme={theme.sidebar} menu={menu} />
            </Sider>
        );
    }

    return (
        // 移动端相当于把整个普通的sider放在抽屉里
        <Drawer
            placement="left"
            open={mobileSide}
            onClose={closeDrawer}
            width={layoutStyles.sidebarWidth}
            closable={false}
            styles={{
                body: {
                    padding: 0,
                },
            }}
        >
            <Layout className="tw-h-full">
                <Sider
                    collapsible={false}
                    width="100%"
                    className="tw-h-full"
                    style={styles}
                    trigger={null}
                >
                    <Logo />
                    <SideMenu theme={theme.sidebar} menu={menu} />
                </Sider>
            </Layout>
        </Drawer>
    );
};

export const EmbedSidebar = () => {
    const { Sider } = Layout;
    const { styles, menu } = useLayout();
    const theme = useLayoutTheme();
    return (
        <Sider collapsible theme={theme.embed} collapsedWidth={styles.sidebarWidth} trigger={null}>
            <SideMenu theme={theme.embed} menu={menu} />
        </Sider>
    );
};
