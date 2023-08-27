import { Layout, Space, theme as AntdTheme } from 'antd';

import clsx from 'clsx';
import { CSSProperties, useCallback, useMemo } from 'react';

import Icon from '@/components/icon/Icon';

import Theme from '@/components/theme';
import { useResponsive, useResponsiveMobileCheck } from '@/utils/hooks';

import { useLayout, useLayoutAction, useLayoutTheme } from '../../hooks';
import Breadcrumb from '../breadcumb';
import { useDrawer, useDrawerChange } from '../drawer/hooks';

import { SideMenu } from '../menu';
import { Logo } from '../sidebar/logo';

const Setting = () => {
    const drawer = useDrawer();
    const changeDrawerVisible = useDrawerChange();
    const toggleDrawer = useCallback(() => changeDrawerVisible(!drawer), [drawer]);
    return (
        <Icon name="iconify:carbon:settings" className="tw-cursor-pointer" onClick={toggleDrawer} />
    );
};

export const LayoutHeader = () => {
    const { Header } = Layout;
    const { isNotebook } = useResponsive();
    const isMobile = useResponsiveMobileCheck();
    const { mode, collapsed, menu, styles: layoutStyles } = useLayout();
    const theme = useLayoutTheme();
    const { toggleCollapse, toggleMobileSide } = useLayoutAction();
    const sideControl = useCallback(() => {
        isMobile ? toggleMobileSide() : toggleCollapse();
    }, [isMobile, isNotebook]);
    const {
        token: { colorBgContainer },
    } = AntdTheme.useToken();
    // header的styles与类
    const styles = useMemo<CSSProperties>(
        () => ({
            height: layoutStyles.headerHeight,
            lineHeight: layoutStyles.headerHeight,
            background: colorBgContainer,
        }),
        [theme.header, layoutStyles],
    );
    // 处理header的模式切换后的字体颜色
    const classes = useMemo(() => {
        if (theme.header === 'dark') return '!tw-text-primary-light !tw-bg-primary-dark';
        return 'tw-bg-white';
    }, [theme.header]);
    console.log('theme.header ', theme.header);
    return (
        <Header style={styles} className={clsx(`tw-flex tw-content-between !tw-px-2 ${classes}`)}>
            <Space>
                {/* 如果当前设备非移动端且布局模式不为"side"，则显示logo */}
                {!isMobile && mode !== 'side' ? (
                    <div className="flex-none">
                        <Logo />
                    </div>
                ) : null}
                {/* 如果当前布局模式非"top"或"embed"或当前设备为移动端，显示sider折叠、drawer抽屉 */}
                {/* 联动侧边栏Icon */}
                {((mode !== 'top' && mode !== 'embed') || isMobile) && (
                    <Icon
                        name={
                            collapsed
                                ? 'iconify:ant-design:menu-unfold-outlined'
                                : 'iconify:ant-design:menu-fold-outline'
                        }
                        className="tw-cursor-pointer"
                        onClick={sideControl}
                    />
                )}
                {/* {(mode === 'top' || mode === 'embed') && <Breadcrumb />} */}
                <Breadcrumb />
            </Space>
            <div className="tw-flex-auto">
                {/* top模式下的导航菜单 */}
                {/* 移动端下不展示上面的导航 */}
                {mode === 'top' && !isMobile ? (
                    <SideMenu mode="horizontal" theme={theme.header} menu={menu} />
                ) : null}
            </div>
            <Space className="tw-flex-none">
                <Theme />
                {/* 设定抽屉 */}
                <Setting />
            </Space>
        </Header>
    );
};
