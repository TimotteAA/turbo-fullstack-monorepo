import { SeedToken } from 'antd/es/theme/internal';
import { ThemeMode } from './constants';

/**
 * theme模块配置
 */
export interface ThemeConfig {
    /** theme主题 */
    mode: `${ThemeMode}`;
    /** antd紧凑模式 */
    compact?: boolean;
    /** 色盲、灰色等辅助功能 */
    auxiliary: {
        /** 灰色 */
        grey?: boolean;
        /** 色盲模式 */
        colorWeakness?: boolean;
    };
    /** antd5 token变量修改 */
    seed?: Partial<SeedToken>;
}

/**
 * theme store的数据
 */
export type ThemeState = ThemeConfig;

export interface ThemeAction {
    changeMode: (mode: `${ThemeMode}`) => void;
    toggleMode: () => void;
    changeCompact: (compact: boolean) => void;
    toggleCompact: () => void;
    changeAuxiliary: (aux: ThemeState['auxiliary']) => void;
    changeSeedToken: (config: Partial<SeedToken>) => void;
}
