import { Dropdown, MenuProps, Tabs, TabsProps, theme as AntdTheme } from 'antd';
import { memo, useCallback, useMemo, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';

import Icon from '@/components/icon/Icon';
import { useActived, useKeepAliveDispatch, useKeepAlives } from '@/components/keepalive/hooks';
import { useRouterStore } from '@/components/router/hooks';
import { RouteOption } from '@/components/router/types';
import { useDeepCompareUpdateEffect } from '@/utils/hooks';

import $styles from './index.module.css';

import IconClear from '~icons/ant-design/minus-outlined';
import IconArrowDown from '~icons/ion/chevron-down-sharp';
import IconClose from '~icons/ion/close-outline';
import IconRefresh from '~icons/ion/md-refresh';
import IconLeft from '~icons/mdi/arrow-collapse-left';
import IconRight from '~icons/mdi/arrow-collapse-right';
import IconExpend from '~icons/mdi/arrow-expand-horizontal';

/**
 * 获得传入路由表中各个路由的id: name对象
 * @param routes 路由表
 * @returns
 */
const getNames = (routes: RouteOption[]) =>
    Object.fromEntries(routes.map((route) => [route.id, route.meta?.name ?? route.id]));

const ExtraButtons: FC<{ actived: string }> = memo(({ actived }) => {
    const lives = useKeepAlives();
    const { removeAlive, removeAlives, refreshAlive, clearAlives } = useKeepAliveDispatch();
    // 当前路由所对应的路由配置对象索引
    const activedIndex = useMemo(
        () => lives.findIndex((item) => item === actived),
        [actived, lives],
    );
    // 禁止删除其他按钮：lives数组中仅有actived
    const disabledRemoveOthers = useMemo(
        () => lives.filter((item) => item !== actived).length <= 0,
        [activedIndex, lives],
    );
    // 禁止删除当前tab左侧的tab：actived是首相
    const disabledLeftRemove = useMemo(() => activedIndex < 1, [activedIndex]);
    // 禁止删除当前tab右侧的tab:actived在最后
    const disabledRightRemove = useMemo(
        () => activedIndex >= lives.length - 1,
        [lives, activedIndex],
    );
    const refreshActived = useCallback(() => refreshAlive(actived), [actived]);

    const removeActived = useCallback(() => {
        removeAlive(actived);
    }, [actived]);
    const removeOthers = useCallback(
        () => removeAlives(lives.filter((item) => item !== actived)),
        [actived, lives],
    );
    /** 删除左边全部的 */
    const removeLeft = useCallback(() => {
        removeAlives(lives.filter((_, idx) => idx < activedIndex));
    }, [lives, activedIndex]);
    // 删除右边全部的
    const removeRight = useCallback(
        () => removeAlives(lives.filter((_, idx) => idx > activedIndex)),
        [lives, activedIndex],
    );
    const menus = useMemo<MenuProps['items']>(
        () => [
            {
                key: 'refresh',
                label: '刷新',
                icon: <Icon component={IconRefresh} />,
                onClick: refreshActived,
            },
            {
                key: 'remove-actived',
                label: '关闭当前',
                icon: <Icon component={IconClose} />,
                onClick: () => {
                    removeActived();
                },
            },
            {
                key: 'remove-others',
                label: '关闭其它',
                icon: <Icon component={IconExpend} />,
                disabled: disabledRemoveOthers,
                onClick: removeOthers,
            },
            {
                key: 'remove-left',
                label: '关闭左侧',
                icon: <Icon component={IconLeft} />,
                disabled: disabledLeftRemove,
                onClick: removeLeft,
            },
            {
                key: 'remove-right',
                label: '关闭右侧',
                icon: <Icon component={IconRight} />,
                disabled: disabledRightRemove,
                onClick: removeRight,
            },
            {
                key: 'remove-all',
                label: '清空标签',
                icon: <Icon component={IconClear} />,
                onClick: clearAlives,
            },
        ],
        [actived, lives],
    );

    return (
        <Dropdown menu={{ items: menus }} placement="bottomRight" trigger={['click']}>
            <span>
                <Icon component={IconArrowDown} />
            </span>
        </Dropdown>
    );
});
const KeepAliveTabs = () => {
    const routes = useRouterStore((state) => state.flat);
    const actived = useActived();
    const lives = useKeepAlives();
    const { changeAlive, removeAlive } = useKeepAliveDispatch();
    const {
        token: { colorBgContainer, colorBorderSecondary, controlItemBgActive },
    } = AntdTheme.useToken();
    const [tabs, setTabs] = useState<TabsProps['items']>([]);

    const remove: NonNullable<TabsProps['onEdit']> = useCallback((id, action: 'add' | 'remove') => {
        if (action !== 'remove' || typeof id !== 'string') return;
        removeAlive(id);
    }, []);
    const [names, setNames] = useState(() => getNames(routes));
    // 监听routes变化
    useDeepCompareUpdateEffect(() => {
        setNames(() => getNames(routes));
    }, [routes]);
    // 监听lives变化，设定tab标签
    useDeepCompareEffect(() => {
        setTabs(
            lives.map((id) => ({
                key: id,
                label: names[id],
                closable: true,
            })) as TabsProps['items'],
        );
    }, [lives]);
    // 只有当有页面加入缓存后，才渲染tab
    return actived ? (
        <div
            className={$styles.container}
            style={
                {
                    backgroundColor: colorBgContainer,
                    '--colorBorderSecondary': colorBorderSecondary,
                    '--controlItemBgActive': controlItemBgActive,
                } as Record<string, any>
            }
        >
            <Tabs
                type="editable-card"
                size="small"
                activeKey={actived}
                onChange={changeAlive}
                onEdit={remove}
                tabBarExtraContent={<ExtraButtons actived={actived} />}
                hideAdd
                destroyInactiveTabPane
                items={tabs}
                animated={{ inkBar: true, tabPane: true }}
            />
        </div>
    ) : null;
};

export default KeepAliveTabs;
