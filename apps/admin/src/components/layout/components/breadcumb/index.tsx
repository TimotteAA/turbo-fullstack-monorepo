import { Breadcrumb as AntdBreadcrumb, theme as AntdTheme } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import clsx from 'clsx';
import { isNil } from 'lodash';
import { FC, useCallback, useMemo } from 'react';
import { Link, matchRoutes, useLocation } from 'react-router-dom';

import Icon from '@/components/icon/Icon';
import { RouterStore } from '@/components/router/store';
import { MenuRouteMeta, RouteOption } from '@/components/router/types';
import { factoryRoutes } from '@/components/router/utils';
import { useResponsiveMobileCheck } from '@/utils/hooks';

import $styles from './index.module.css';
import './index.css';

// 获取相同层级的路由项
const getSameLevelRoutes = (routes: RouteOption[], targetRoute: RouteOption): RouteOption[] => {
    // 获取目标路由的父ID
    const parentId = targetRoute?.meta?.parent;

    // 如果目标路由没有父ID，那么它是顶级路由，返回所有顶级路由项
    if (!parentId) {
        return routes.filter((route) => !route.meta?.parent);
    }

    // 返回所有与目标路由有相同父ID的路由项
    return routes.filter((route) => route.meta?.parent === parentId);
};

// 对于 matches 中的除了顶点的项，获取同层的路由项
const processMatches = (routes: RouteOption[], matches: RouteOption[]): RouteOption[][] => {
    const result: RouteOption[][] = [];

    for (let i = 1; i < matches.length; i++) {
        // 从索引 1 开始，因为我们要跳过顶点
        result.push(getSameLevelRoutes(routes, matches[i]));
    }

    return result;
};

const Breadcrumb: FC = () => {
    const isMobile = useResponsiveMobileCheck();

    const location = useLocation();
    const { routes, basepath, flat } = RouterStore(
        useCallback(
            (state) => ({
                routes: state.routes,
                basepath: state.config.basepath,
                flat: state.flat,
            }),
            [],
        ),
    );
    const matches = matchRoutes(factoryRoutes(routes), location, basepath)!;
    const {
        token: { colorPrimaryText },
    } = AntdTheme.useToken();
    const renderItems = processMatches(
        flat,
        matches.map(({ route }) => route),
    );
    // 路由数据
    const items: ItemType[] = useMemo(() => {
        return matches?.slice(1).map((matchItem, index) => {
            const route = matchItem.route as RouteOption;
            const { name, icon } = route?.meta as MenuRouteMeta;
            const classes = clsx(
                { breadActive: matchItem.pathname === location.pathname },
                $styles.link,
            );

            const menuItem: ItemType = {
                title: (
                    <Link
                        to={matchItem.pathname}
                        style={
                            {
                                '--colorPrimaryText': colorPrimaryText,
                            } as Record<string, any>
                        }
                        className={classes}
                    >
                        {icon ? (
                            typeof icon === 'string' ? (
                                <Icon name={icon} />
                            ) : (
                                <Icon component={icon} />
                            )
                        ) : null}
                        {name}
                    </Link>
                ),
                key: matchItem.pathname,
                className: $styles.myLink,
            };

            // 如果在对应的renderItems中有多个同级路由，那么我们为该项添加menu属性
            if (renderItems[index] && renderItems[index].length > 1) {
                menuItem.menu = {
                    items: renderItems[index]
                        .filter((renderItem) => renderItem.id !== matchItem.route.id)
                        .map((routeItem) => {
                            const { meta } = routeItem;
                            return {
                                // 你可以根据需要自定义menu items的属性
                                // title: routeItem.meta?.name,
                                label: (
                                    <Link
                                        to={routeItem.path}
                                        style={
                                            {
                                                '--colorPrimaryText': colorPrimaryText,
                                            } as Record<string, any>
                                        }
                                        className={$styles.link}
                                    >
                                        {meta.icon ? (
                                            typeof meta.icon === 'string' ? (
                                                <Icon name={meta.icon} />
                                            ) : (
                                                <Icon component={meta.icon} />
                                            )
                                        ) : null}
                                        {meta?.name || routeItem.id}
                                    </Link>
                                ),
                                key: routeItem.id,
                                // link: routeItem.path,
                                // 其他需要的属性...
                            };
                        }),
                };
            }

            return menuItem;
        });
    }, [matches, renderItems]);
    if (isMobile || isNil(matches)) return null;

    return <AntdBreadcrumb className={$styles.antdLink} items={items as any} />;
};

export default Breadcrumb;
