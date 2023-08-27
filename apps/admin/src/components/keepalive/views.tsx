/**
 * @author timotte
 * @description
 * 1. KeepAlive 是最外层的组件，
 *    负责初始化 KeepAliveStore，包括根据 router 配置设定 keepalive 的根路径和 404 页面等，
 *    并监听 lives，设置为 include。
 *    在组件卸载前取消订阅。
 *
 * 2. Provider 组件监听 location 的变化，
 *    根据变化计算出当前 route 的 ID。
 *    当需要刷新时，点击刷新按钮，设定 store 中的 reset，
 *    Provider 当 reset 有值时，会调用 KeepContainer 刷新路由。
 *    如果当前的 tab 是根路由，则直接渲染子组件；否则，渲染 KeepContainer 组件。
 *
 * 3. KeepContainer 组件负责缓存和刷新路由页面。
 *    当路由改变时，它会创建一个新的 KeepPage 组件并将其添加到 pages.current 数组中；
 *    当路由被刷新时，它会移除原来的 KeepPage 组件，然后创建一个新的并添加到原来的位置。
 *    如果 pages.current 数组的长度超过了最大缓存数量，它会移除最早被缓存的页面。
 *
 * 4. KeepPage 组件是一个包装器，它包含了真正的页面内容。
 *    它使用 useEffect 监听 isActive 的变化，当 isActive 变为 false 时，它会将自己从 renderDiv 中移除，
 *    从而实现了页面的卸载；当 isActive 变为 true 时，它会将自己添加到 renderDiv 中，从而实现了页面的挂载。
 *    如果一个新的 KeepPage 被创建，那么它的 isActive 会被设置为 true，并被渲染到 targetElement 中。
 */
import { useUpdate, useUpdateEffect } from 'ahooks';
import { isNil, map, findIndex } from 'lodash';
import {
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';

import { matchRoutes, useLocation, useOutlet } from 'react-router-dom';

import { useUnmount } from 'react-use';

import { deepMerge } from '@/utils';

import { useNavigator } from '../router/hooks';

import { RouterStore } from '../router/store';

import { factoryRoutes } from '../router/utils';

import { KeepAliveDispatchContext, KeepAliveIdContext, KeepAliveAction } from './constants';
import { KeepAliveStore } from './store';
import { AlivePageProps } from './types';

interface ParentRef {
    refresh: (resetId: string) => void;
}

/**
 * KeepOutlet负责保存页面实际内容，同时有自己的id
 *
 * @param param0
 * @returns
 */
const KeepOutlet: FC<{ id: string }> = ({ id }) => {
    const outlet = useOutlet();
    return useMemo(
        () => <KeepAliveIdContext.Provider value={id}>{outlet}</KeepAliveIdContext.Provider>,
        [],
    );
};

/**
 * children，outlet也就是实际内容
 * 每个新的KeepPage都会把页面内容放到state里
 * 然后根据active来进行dom移除
 *
 * @param param0
 * @returns
 */
const KeepPage: FC<AlivePageProps & { children: ReactNode }> = ({
    isActive,
    // outlet的实际内容
    children,
    id,
    renderDiv,
}) => {
    // 保存页面state的div
    const [targetElement] = useState(() => document.createElement('div'));
    // 当前页面是否激活
    const activedRef = useRef(false);
    activedRef.current = activedRef.current || isActive;
    // 根据当前页面是否被激活来移除targetElement
    useEffect(() => {
        if (isActive) {
            renderDiv.current?.appendChild(targetElement);
        } else {
            try {
                renderDiv.current?.removeChild(targetElement);
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    }, [isActive, id, renderDiv, targetElement]);
    useEffect(() => {
        // 添加一个id 作为标识 并没有什么太多作用
        targetElement.setAttribute('id', id);
    }, [id, targetElement]);

    // 每次当有新的page到来后，都会是active，被渲染到targetElement中
    return <>{activedRef.current && createPortal(children, targetElement)}</>;
};

const KeepContainer = forwardRef<ParentRef, { active: string; reset: string | null }>(
    ({ active, reset }, ref) => {
        const { exclude, include, maxLen } = KeepAliveStore(
            useCallback((state) => ({ ...state }), []),
        );
        // refresh页面的index
        const redo = useRef<number | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        // 所有的Pages
        const pages = useRef<
            Array<{
                id: string;
                // 页面内容
                component: ReactNode;
            }>
        >([]);
        const update = useUpdate();
        // 对外暴露刷新方法
        /**
         * 当调用refresh方法时，将这个页面的index赋值给redo.current，然后删除页面
         * 下一个useLayoutEffect中会根据redo.current的值，重新设置一个页面
         * 注意此时路由不变，之前的page被删掉后，重新调用useOutlet拿到页面
         */
        useImperativeHandle(
            ref,
            () => ({
                refresh: (resetId) => {
                    if (!isNil(resetId) && isNil(redo.current)) {
                        redo.current = findIndex(pages.current, (item) => item.id === resetId);
                        pages.current = pages.current.filter((page) => {
                            return page.id !== resetId;
                        });
                    }
                },
            }),
            [],
        );
        useLayoutEffect(() => {
            if (isNil(reset) || isNil(redo.current)) return;
            pages.current.splice(redo.current, 0, {
                id: reset,
                component: <KeepOutlet id={reset} />,
            });
            redo.current = null;
            update();
            // 对reset对应的页面进行了刷新，将state还原
            KeepAliveStore.dispatch({
                type: KeepAliveAction.RESET,
                payload: {
                    id: null,
                },
            });
        }, [reset]);
        useLayoutEffect(() => {
            if (isNil(active)) return;
            // 超过缓存数量，干掉第一个
            if (pages.current.length >= maxLen) {
                pages.current = pages.current.slice(1);
            }
            // 新的active不在pages中
            const page = pages.current.find((item) => item.id === active);
            if (isNil(page)) {
                pages.current = [
                    ...pages.current,
                    {
                        id: active,
                        // 新的页面，新的state
                        component: <KeepOutlet id={active} />,
                    },
                ];
                // 更新视图
                update();
            }
            // eslint-disable-next-line consistent-return
            return () => {
                // 处理 黑白名单
                if (isNil(exclude) && isNil(include)) return;
                pages.current = pages.current.filter(({ id }) => {
                    if (exclude && exclude.includes(id)) return false;
                    if (include) return include.includes(id);
                    return true;
                });
            };
        }, [active, exclude, maxLen, include]);
        return (
            <>
                {/* keepalive page容器 */}
                <div ref={containerRef} className="keepAlive" />
                {map(pages.current, ({ id, component }) => {
                    return (
                        <KeepPage
                            isActive={active === id}
                            renderDiv={containerRef}
                            id={id}
                            key={id}
                        >
                            {component}
                        </KeepPage>
                    );
                })}
            </>
        );
    },
);

/**
 * 监听location变化，从routes计算出location对应的路由id
 * 刷新的逻辑：点击刷新按钮，设定store中的reset，Provider当reset有值时，会调用KeepContainer刷新路由
 * @param param0
 * @returns
 */
const Provider: FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigator();
    const { path, reset } = KeepAliveStore((state) => ({ ...state }));
    // 新的tab是否是根路由
    const [isRoot, setIsRoot] = useState(true);
    // 需要刷新的tab id
    const [resetId, setResetId] = useState<string | null>(null);
    // 刷新调用KeepContainer方法
    const ref = useRef<ParentRef | null>(null);
    // 监听location的变化，从routes计算出当前route
    const matchRouteId = useMemo(() => {
        const { config, routes, flat } = RouterStore.getState();
        const matches = matchRoutes(factoryRoutes(routes), location, config.basepath);
        if (isNil(matches) || matches.length < 1) return null;
        // 返回的是所有匹配的route，最后一个是当前的
        const match = matches[matches.length - 1];
        // 找到对应的item，在doc中定义了文档
        const item = flat.find((r) => r.id === (match.route as any).id);
        if (!item) return null;
        return item.id;
    }, [location]);
    // 渲染缓存和判断404
    useEffect(() => {
        const { flat } = RouterStore.getState();
        const matchItem = flat.find((item) => item.id === matchRouteId);
        // 检查是否是根路径
        const checkroot = !!(
            matchItem &&
            matchItem.path === path &&
            // 常见的根路径设定：
            // 1. path是根路径，但没有index
            // 2. index为true，没有子路由（和别的‘首页’区别在于有无页面）
            (!matchItem.index || (matchItem.index && isNil(matchItem.page)))
        );
        setIsRoot(checkroot);
        // 根路由对应Layout，什么都不做
        if (checkroot) return;
        if (matchRouteId) {
            KeepAliveStore.dispatch({ type: KeepAliveAction.ADD, payload: { id: matchRouteId } });
            KeepAliveStore.dispatch({
                type: KeepAliveAction.ACTIVE,
                payload: { id: matchRouteId },
            });
        } else if (location.pathname !== path) {
            // navigate({pathname: notFound});
        }
    }, [matchRouteId, location, navigate]);
    // 如果存在要reset的组件，调用refresh方法
    useUpdateEffect(() => {
        setResetId(reset);
        if (isNil(reset)) return;
        ref.current && ref.current.refresh(reset);
        // 对reset对应的页面进行了刷新，将state还原
        // KeepAliveStore.dispatch({
        //     type: KeepAliveAction.RESET,
        //     payload: {
        //         id: null,
        //     },
        // });
    }, [reset]);
    return isRoot || isNil(matchRouteId) ? (
        <>{children}</>
    ) : (
        <KeepAliveDispatchContext.Provider value={KeepAliveStore.dispatch}>
            <KeepContainer active={matchRouteId} reset={resetId} ref={ref} />
        </KeepAliveDispatchContext.Provider>
    );
};

/**
 * 最外层KeepAlive组件
 * 主要负责初始化KeepAliveStore：根据router得到根路径、404页面等
 * 监听lives，设置为include，在卸载前取消订阅
 *
 * @param param0
 */
const KeepAlive: FC<{ children: ReactNode }> = ({ children }) => {
    // 根据router配置设定keepalive的跟路径、notFound页面
    const config = RouterStore((state) => state.config);
    const setuped = KeepAliveStore((state) => state.setuped);
    const listenLives = KeepAliveStore.subscribe(
        (state) => state.lives,
        (lives) => {
            KeepAliveStore.setState((state) => {
                state.include = lives;
            });
        },
    );
    // keepalivestore没有配置好
    useEffect(() => {
        if (!setuped) {
            KeepAliveStore.setState(
                (state) =>
                    deepMerge(
                        state,
                        {
                            path: config.basepath,
                            notFound: config.notFound,
                            setuped: true,
                        },
                        'replace',
                    ),
                true,
            );
        }
    }, [config.basepath, config.notFound, setuped]);
    // 卸载前取消订阅
    useUnmount(() => {
        listenLives();
    });
    return <Provider>{children}</Provider>;
};
export default KeepAlive;
