import DarkReader from 'darkreader';

import { ThemeMode } from './constants';

/**
 * theme模块配置
 */
export interface ThemeConfig {
    /** theme主题 */
    mode: `${ThemeMode}`;
    /** antd紧凑模式 */
    compact?: boolean;
    /** dark-reader配置 */
    darken?: DarkReaderConfig;
}

/**
 * theme store的数据
 */
export type ThemeState = Omit<ThemeConfig, 'darken'> & {
    darken: DarkReaderConfig;
};

export interface ThemeAction {
    changeMode: (mode: `${ThemeMode}`) => void;
    toggleMode: () => void;
    changeCompact: (compact: boolean) => void;
    toggleCompact: () => void;
    /** 改变主题色 */
    // changePrimaryColor: (color: string) => void;
}

/**
 * darker配置类型
 */
export interface DarkReaderConfig {
    theme?: Partial<DarkReader.Theme>;
    fixes?: Partial<DarkReader.DynamicThemeFix>;
}
