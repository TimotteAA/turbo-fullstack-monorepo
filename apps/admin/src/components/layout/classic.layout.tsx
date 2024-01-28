import { useDebounceFn } from 'ahooks';
import { Layout, theme, Breadcrumb, Menu } from 'antd';
import { ReactNode, memo, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { useRouterStore } from '../router/hooks';

import { LayoutHeader } from './components/header';
import { getMenuItem } from './components/menu';
import { useLayout } from './hooks';

const { Content, Sider, Footer } = Layout;

const ClassicLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const { menu, mode } = useLayout();
    const [collapsed, setCollapsed] = useState(true);

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
        if (!collapsed) ref.current = opens;
    }, [opens]);

    useUpdateEffect(() => {
        if (collapsed) {
            // 折叠后，menu的state和其他两种模式下的一致
            changeOpens(menu.opens);
        } else {
            // 非折叠态，切换折叠后，重新设置一下
            changeOpens(ref.current);
        }
    }, [collapsed, menu.opens]);

    useUpdateEffect(() => {
        if (mode !== 'side') {
            setOpens(menu.opens);
        }
    }, [menu, mode]);

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
                    // inlineCollapsed={collapsed}
                    theme="light"
                    items={menus.map((item) => getMenuItem(item))}
                    mode="inline"
                    openKeys={opens}
                    selectedKeys={menu.selects}
                    onOpenChange={changeOpens}
                />
            </Sider>
            <Layout>
                <LayoutHeader />
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};

export default memo(ClassicLayout);
