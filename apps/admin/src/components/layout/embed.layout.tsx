import { Layout, Menu } from 'antd';
import { ReactNode, memo } from 'react';
import LayoutContent from './components/content';
import { LayoutHeader } from './components/header';
import { getMenuItem } from './components/menu';
import { useLayout } from './hooks';

const { Content, Sider } = Layout;

/**
 * embed模式布局
 * @param param0
 * @returns
 */
const EmbedLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { menu } = useLayout();
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
                    <Sider>
                        <Menu
                            items={menu.data.map((item) => getMenuItem(item))}
                            selectedKeys={menu.selects}
                        />
                    </Sider>
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

export default memo(EmbedLayout);
