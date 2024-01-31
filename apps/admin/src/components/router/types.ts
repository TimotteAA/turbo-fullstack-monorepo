import { ComponentType, FunctionComponent, ReactElement } from 'react';

import { DataRouteObject, NavigateOptions, Path } from 'react-router';

import { IconComponent, IconName } from '../icon/types';

/** 路由store */
export interface RouterState<T extends RecordAnyOrNever = RecordNever> {
    ready: boolean;
    /** 路由表 */
    routes: RouteOption<T>[];
    /** 展平后的路由表 */
    flat: RouteOption<T>[];
    /** 所有的菜单 */
    menus: RouteOption<T>[];
    // 路由表配置在其中，上面三项是经过处理后的路由
    config: RouterConfig<T>;
}

/**
 * 全局路由配置
 */
export interface RouterConfig<T extends RecordAnyOrNever = RecordNever> {
    /** 根路径，默认为'/' */
    basepath?: string;
    // 是否启用hash模式
    hash?: boolean;
    /** 404页面 */
    notFound?: string | ComponentType;
    /** global window */
    window?: Window;
    /** 自定义路由组件加载loading */
    loading?: FunctionComponent;
    /** 某个页面的自定义包装器 */
    render?: CustomRender;
    /** 默认的登录页 */
    auth?: { enabled?: boolean; path?: string; page?: string | ComponentType };
    /** 前端路由列表 */
    routes: RouteOption<T>[];
}

/**
 * 路由配置
 */
export interface RouteOption<T extends RecordAnyOrNever = RecordNever>
    extends Omit<DataRouteObject, 'children' | 'Component' | 'ErrorBoundary' | 'lazy' | 'id'> {
    id: string;
    /** 是否是菜单项 */
    menu?: boolean;
    divide?: boolean;
    // 父路由不需要页面，但有子路由时
    onlyGroup?: boolean;

    /** 路由页面，可以是组件或者组件所在路径 */
    page?: ComponentType | string | null;
    /** 异常页面,可以是组件或组件路径字符串 */
    error?: ComponentType | string | null;
    /** 自定义Render，覆盖全局 */
    pageRender?: CustomRender;
    /** 自定义异常render，覆盖全局 */
    errorRender?: CustomRender;
    /** 独立配置loading,如果不设置则使用总配置的loading */
    loading?: FunctionComponent | false;
    /** 权限路由配置 */
    auth?: false | RouteAuth;
    meta?: MenuRouteMeta<T>;
    children?: RouteOption<T>[];
}

/** 页面组件 */
export type RoutePage<T extends RecordAnyOrNever = RecordNever> = ComponentType<
    { route: RouteComponentProps } & T
>;

/** 传给页面的参数 */
export type RouteComponentProps = Omit<RouteOption, 'component'>;

/** 菜单相关元元素 */
export type MenuRouteMeta<T extends RecordAnyOrNever = RecordNever> = RecordScalable<
    {
        /** 菜单显示名称 */
        name?: string;
        /** 是否隐藏菜单  */
        hide?: boolean;
        /** 显示图标 */
        icon?: IconComponent | IconName;
        /** <a>标签上的target,用于菜单打开外链 */
        target?: '_parent' | '_self' | '_top' | '_blank';
        /** 父级路由，用于构成面包屑 */
        parent?: string;
        /** iframe */
        iframe?: boolean;
        iframeSrc?: string;
    },
    T
>;

/**
 * 路由所需权限配置
 */
export interface RouteAuth {
    enabled?: false;
    permissions?: string[];
}

/** 自定义页面加载器 */
export type CustomRender<T extends RecordAnyOrNever = RecordNever> = (
    props: RouteOption & T,
    component: RoutePage<T>,
) => ReactElement;

/** ********************************* 路由跳转函数 ********************************* */
interface RoutePath extends Path {
    id: string;
    name: string;
}
export type NavigateTo = string | Partial<RoutePath>;
export interface RouteNavigator {
    (to: NavigateTo, options?: NavigateOptions): void;
}
