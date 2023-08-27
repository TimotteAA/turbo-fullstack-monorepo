import { LayoutMode } from '../../constants';
import { ColorConfig } from '../../types';

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
        title: '左侧菜单',
        type: LayoutMode.SIDE,
    },
    {
        title: '左侧菜单，Logo在顶部',
        type: LayoutMode.CONTENT,
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

/**
 * 选择主颜色
 */
export const ColorList: { title: string; type: `${ColorConfig}` }[] = [
    {
        title: '主色',
        type: 'primary',
    },
    {
        title: '信息',
        type: 'info',
    },
    {
        title: '成功',
        type: 'success',
    },
    {
        title: '错误',
        type: 'error',
    },
    {
        title: '警告',
        type: 'warning',
    },
];
