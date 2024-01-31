import { theme as AntdTheme, Layout, Menu, Space } from 'antd';
import clsx from 'clsx';
import { CSSProperties, useCallback, useMemo } from 'react';

import Icon from '@/components/icon/Icon';
import Theme from '@/components/theme';
import { useResponsiveMobileCheck } from '@/utils/hooks';

import Breadcrumb from '../breadcumb';
import { getMenuItem } from '../menu';

import { useLayout, useLayoutTheme } from '../../hooks';
import { useDrawer, useDrawerChange } from '../drawer/hooks';

const Logo = () => <div>Logo</div>;

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

    const isMobile = useResponsiveMobileCheck();
    const { mode, menu, styles: layoutStyles } = useLayout();
    const theme = useLayoutTheme();

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

    return (
        <Header style={styles} className={clsx(`tw-flex tw-content-between !tw-px-2 ${classes}`)}>
            <Space>
                {/* 如果当前设备非移动端且布局模式不为"side"，则显示logo */}
                {!isMobile && mode !== 'side' ? (
                    <div className="flex-none">
                        <Logo />
                    </div>
                ) : null}
                {/* {(mode === 'top' || mode === 'embed') && <Breadcrumb />} */}
                {mode !== 'top' ? <Breadcrumb /> : null}
            </Space>
            <div className="tw-flex-auto">
                {/* top模式下的导航菜单 */}
                {/* 移动端下不展示上面的导航 */}
                {mode === 'top' && !isMobile ? (
                    <Menu
                        inlineIndent={18}
                        mode="horizontal"
                        items={menu.data.map((item) => getMenuItem(item))}
                        selectedKeys={menu.selects}
                    />
                ) : null}
            </div>
            <Space className="tw-flex-none">
                <Theme />
                {/* 设定抽屉 */}
                <Setting />
                {/* 主题皮肤相关 */}
            </Space>
        </Header>
    );
};
