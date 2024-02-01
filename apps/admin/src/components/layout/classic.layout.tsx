import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { Layout, Menu } from 'antd';
import { ReactNode, memo, useCallback, useEffect, useRef, useState } from 'react';

import { useRouterStore } from '../router/hooks';

import { isNil } from 'lodash';
import LayoutContent from './components/content';
import { LayoutHeader } from './components/header';
import { getMenuItem } from './components/menu';
import { useLayout } from './hooks';

const { Sider } = Layout;

const ClassicLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { menu, mode } = useLayout();
    const [collapsed, setCollapsed] = useState(false);

    // 用于保存collapsed引起的opens的变化
    const ref = useRef<string[]>([]);
    const { menus } = useRouterStore();
    // 打开的
    const [opens, setOpens] = useState<string[]>([]);
    const { run: changeOpens } = useDebounceFn((data: string[]) => setOpens(data), {
        wait: 50,
    });
    useUpdateEffect(() => {
        // 非折叠情况下，保存打开的keys
        // 在折叠切换后还原state
        if (!collapsed && !isNil(opens)) ref.current = opens;
    }, [opens]);

    useEffect(() => {
        changeOpens(menu.opens);
    }, []);

    // 确保只能打开一个顶级菜单
    const onOpenChange = useCallback(
        (keys: string[]) => {
            if (mode === 'top' || !opens) return;
            if (!collapsed) {
                setOpens(keys);
                return;
            }
            // 新加入的key
            const latest = keys.find((key) => opens.indexOf(key) === -1);
            if (latest && menu.rootSubKeys.indexOf(latest) === -1) {
                setOpens(keys);
            } else {
                setOpens(latest ? [latest] : []);
            }
        },
        [opens, mode, menu, collapsed],
    );

    useUpdateEffect(() => {
        // 打开后，重新设置下opens
        if (!collapsed) {
            changeOpens(ref.current);
        }
    }, [collapsed]);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                breakpoint="lg"
            >
                <div className="demo-logo-vertical" />
                <Menu
                    inlineIndent={16}
                    items={menus.map((item) => getMenuItem(item))}
                    mode={'inline'}
                    openKeys={opens}
                    selectedKeys={menu.selects}
                    // onOpenChange={changeOpens}
                    onOpenChange={onOpenChange}
                />
            </Sider>
            <Layout>
                <LayoutHeader />
                <LayoutContent>{children}</LayoutContent>
            </Layout>
        </Layout>
    );
};

export default memo(ClassicLayout);
