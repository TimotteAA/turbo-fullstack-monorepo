import { LayoutState } from './types';

export const defaultLayoutConfig: Omit<LayoutState, 'mobileSide'> = {
    mode: 'side',
    collapsed: false,
    theme: {
        sidebar: 'dark',
        header: 'light',
        embed: 'light',
    },
    fixed: {
        header: false,
        sidebar: false,
        embed: false,
    },
    styles: {
        sidebarWidth: '12.5rem',
        sidebarCollapseWidth: '4rem',
        headerHeight: '3rem',
        headerLightColor: '#fff',
    },
    /** 菜单数据 */
    menu: {
        data: [],
        opens: [],
        selects: [],
        rootSubKeys: [],
        split: {
            data: [],
            selects: [],
        },
    },
};
