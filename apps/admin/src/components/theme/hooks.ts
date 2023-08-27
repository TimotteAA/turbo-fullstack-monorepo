import { isNil } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

import { useUnmount } from 'react-use';

import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { debounceRun } from '@/utils/helpers';

import { ThemeMode } from './constants';
import { ThemeStore } from './store';

/**
 * 获取themestore的state
 */
export const useTheme = () =>
    useStore(ThemeStore, (state) => ({ mode: state.mode, compact: state.compact }), shallow);

/**
 * 获取dark-reader配置
 */
export const useDarken = () => useStore(ThemeStore, (state) => state.darken);

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
    toggleCompact: useCallback(
        useStore(ThemeStore, (state) => state.toggleCompact),
        [],
    ),
});

const ThemeModeListener = async (mode: `${ThemeMode}`) => {
    // 处理tailwindcss的暗黑主题
    // const { mode: theme, darken } = ThemeStore.getState();
    const reverse = mode === 'dark' ? 'light' : 'dark';
    const html = document.documentElement;
    html.classList.remove(reverse);
    html.classList.remove(mode);
    html.classList.add(mode);
    // if (typeof window !== 'undefined') {
    //     const { enable: enableDarkMode, disable: disableDarkMode } = await import('darkreader');
    //     if (theme === 'dark') {
    //         enableDarkMode(darken.theme ?? {}, darken.fixes as any);
    //     } else {
    //         disableDarkMode();
    //     }
    // }
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
