import { LayoutMode } from '../../constants';

/**
 * 布局组件混合主题色：侧边栏和header
 */
export enum LayoutTheme {
    DARKLIGHT = 'dark-light',
    LIGHTDARK = 'light-dark',
    LIGHTLIGHT = 'light-light',
    DARKDARK = 'dark-dark',
}

export const LayoutModeList: { title: string; type: `${LayoutMode}` }[] = [
    {
        title: '经典菜单',
        type: LayoutMode.CLASSIC,
    },
    {
        title: '顶部菜单',
        type: LayoutMode.TOP,
    },
    {
        title: '嵌入双菜单',
        type: LayoutMode.EMBED,
    },
];

export const LayoutThemeList: { title: string; type: `${LayoutTheme}` }[] = [
    {
        title: '左侧暗-顶部亮',
        type: LayoutTheme.DARKLIGHT,
    },
    {
        title: '左侧亮-顶部暗',
        type: LayoutTheme.LIGHTDARK,
    },
    {
        title: '左侧亮-顶部亮',
        type: LayoutTheme.LIGHTLIGHT,
    },
    {
        title: '左侧暗-顶部暗',
        type: LayoutTheme.DARKDARK,
    },
];
