import { createContext } from 'react';

import { LayoutTheme } from './types';

/**
 * 侧边栏和顶栏布局模式
 */
export enum LayoutMode {
    /** 只有顶部导航，菜单项和logo都在顶部*** */
    TOP = 'top',
    /** 侧边导航，顶栏自定义内容（keepalive)*************** */
    SIDE = 'side',
    /** 上面header，下面就是Layout与Content */
    CONTENT = 'content',
    /** 左、上导航都在，侧边折叠仅显示icon，额外导航显示menu */
    EMBED = 'embed',
}

/**
 * 布局组件
 */
export enum LayoutComponent {
    /** 顶栏 */
    HEADER = 'header',
    /** 侧边栏 */
    SIDEBAR = 'sidebar',
    /** 侧边内嵌导航，仅在mode为embed时生效 */
    EMBED = 'embed',
}

export enum LayoutActionType {
    /** 更改组件固定 */
    CHANGE_FIXED = 'change_fixed',
    /** 更改CSS变量 */
    CHANGE_STYLES = 'change_styles',
    /** 更改布局模式 */
    CHANGE_MODE = 'change_mode',
    /** 重置菜单 */
    CHANGE_MENU = 'change_menu',
    /** 更改组件主题 */
    CHANGE_THEME = 'change_theme',
    /** 更改侧边缩进 */
    CHANGE_COLLAPSE = 'change_collapse',
    /** 反转侧边缩进 */
    TOGGLE_COLLAPSE = 'toggle_collapse',
    /** 更改移动模式下的侧边缩进 */
    CHANGE_MOBILE_SIDE = 'change_mobile_side',
    /** 反转移动模式下的侧边缩进 */
    TOGGLE_MOBILE_SIDE = 'toggle_mobile_side',
}

/**
 * 黑色主体的布局组件
 */
export const layoutDarkTheme: LayoutTheme = {
    header: 'dark',
    sidebar: 'light',
    embed: 'light',
};

/**
 * 默认布局组件为亮色
 */
const defaultLayoutTheme: LayoutTheme = {
    header: 'light',
    sidebar: 'dark',
    embed: 'light',
};

export const LayoutThemeContext = createContext<LayoutTheme>(defaultLayoutTheme);
