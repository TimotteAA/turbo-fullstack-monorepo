import { Layout } from 'antd';
import { ReactNode, memo } from 'react';

import LayoutContent from './components/content';
import { LayoutHeader } from './components/header';

const { Content } = Layout;

/**
 * top模式的布局
 *
 * @param param0
 * @returns
 */
const TopLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <LayoutHeader />
            <Content>
                <LayoutContent>{children}</LayoutContent>
            </Content>
        </Layout>
    );
};

export default memo(TopLayout);
