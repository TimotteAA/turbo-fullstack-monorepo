import { useDeepCompareEffect } from 'ahooks';
import { useRef, DependencyList, EffectCallback, useState } from 'react';
import { useMedia, useUpdateEffect } from 'react-use';

import { config } from '@/config';

import { defaultScreenConfig } from './constants';

import { deepMerge } from '.';

/**
 * 深度比较版本的useUpdateEffect
 * @param effect
 * @param deps
 */
export const useDeepCompareUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
    // 是否首次渲染，默认为true
    const isFirst = useRef(false);

    // 深度比较依赖
    useDeepCompareEffect(() => {
        // 非初次渲染才会执行
        if (!isFirst.current) {
            return effect();
        }
        isFirst.current = false;
    }, deps);
};

export const useResponsive = () => {
    const screenSize = deepMerge(defaultScreenConfig, config().screen ?? {}, 'replace');
    const mobile = useMedia(`(max-width: ${screenSize.sm - 1}px)`, true);
    const tablet = useMedia(`(max-width: ${screenSize.md - 1}px)`, true);
    const notebook = useMedia(`(max-width: ${screenSize.lg - 1}px)`, true);
    const pc = useMedia(`(min-width: ${screenSize.lg}px)`, true);
    const [isMobile, setMobile] = useState(mobile);
    const [isTablet, setTablet] = useState(tablet);
    const [isNotebook, setNotebook] = useState(notebook);
    const [isPC, setPC] = useState(pc);
    useUpdateEffect(() => {
        setMobile(mobile);
        setNotebook(notebook);
        setTablet(tablet);
        setPC(pc);
    }, [pc, mobile, notebook, tablet]);

    return { isMobile, isTablet, isNotebook, isPC };
};

/**
 * 通过响应式检测是否为移动设备屏幕
 */
export const useResponsiveMobileCheck = () => {
    const screenSize = deepMerge(defaultScreenConfig, config().screen ?? {});
    const responsive = useMedia(`(max-width: ${screenSize.sm - 1}px)`, true);
    const [isMobile, setMobile] = useState(responsive);
    useUpdateEffect(() => {
        setMobile(responsive);
    }, [responsive]);
    return isMobile;
};
