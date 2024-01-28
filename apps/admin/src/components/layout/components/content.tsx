import { memo, ReactNode } from 'react';

import KeepAlive from '@/components/keepalive/views';

import $styles from '../styles/index.module.css';

import KeepAliveTabs from './tabs';

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

export default memo(LayoutContent);
