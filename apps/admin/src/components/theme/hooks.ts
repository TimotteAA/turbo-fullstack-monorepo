import { isNil } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

import { useUnmount } from 'react-use';

import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { debounceRun } from '@/utils/helpers';

import { ThemeMode } from './constants';
import { ThemeStore } from './store';
import { ThemeState } from './types';

/**
 * 获取themestore的state
 */
export const useTheme = () => useStore(ThemeStore, (state) => state, shallow);

/**
 * 操作主题
 */
export const useThemeAction = () => ({
    changeMode: useCallback(
        useStore(ThemeStore, (state) => state.changeMode),
        [],
    ),
    toggleMode: useCallback(
        useStore(ThemeStore, (state) => state.toggleMode),
        [],
    ),
    changeCompact: useCallback(
        useStore(ThemeStore, (state) => state.changeCompact),
        [],
    ),
    changeAuxiliary: useCallback(
        useStore(ThemeStore, (state) => state.changeAuxiliary),
        [],
    ),
    changeSeedToken: useCallback(
        useStore(ThemeStore, (state) => state.changeSeedToken),
        [],
    ),
});

/**
 * tailwindcss改变主题的订阅
 * @param mode
 */
const ThemeModeListener = async (mode: `${ThemeMode}`) => {
    // 处理tailwindcss的暗黑主题
    const reverse = mode === 'dark' ? 'light' : 'dark';
    const html = document.documentElement;
    html.classList.remove(reverse);
    html.classList.remove(mode);
    html.classList.add(mode);
};

export const useThemeListener = () => {
    const debounceRef = useRef();
    let ubSub: () => void;
    useEffect(() => {
        ubSub = ThemeStore.subscribe(
            (state) => state.mode,
            (m) => debounceRun(debounceRef, async () => ThemeModeListener(m)),
            {
                fireImmediately: true,
            },
        );
    }, []);
    useUnmount(() => {
        if (!isNil(ubSub)) {
            ubSub();
        }
    });
};

const AuxiliaryListener = (aux: ThemeState['auxiliary']) => {
    if (aux['colorWeakness']) {
        document.body.style.filter = 'invert(80%)';
        return;
    } else if (aux['grey']) {
        document.body.style.filter = 'grayscale(1)';
        return;
    }
    document.body.style.filter = null;
};

export const useAuxiliaryListener = () => {
    const debounceRef = useRef();
    let ubSub: () => void;
    useEffect(() => {
        ubSub = ThemeStore.subscribe(
            (state) => state.auxiliary,
            (enabled) => debounceRun(debounceRef, async () => AuxiliaryListener(enabled)),
            {
                fireImmediately: true,
            },
        );
    }, []);
    useUnmount(() => {
        if (!isNil(ubSub)) {
            ubSub();
        }
    });
};
