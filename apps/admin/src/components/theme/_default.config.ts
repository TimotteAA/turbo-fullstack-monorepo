import { ThemeState } from './types';

/**
 * 默认theme state配置
 */
export const defaultTheme: ThemeState = {
    mode: 'light',
    compact: false,
    auxiliary: {
        grey: false,
        colorWeakness: false,
    },
    seed: {
        colorPrimary: '#1677ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorLink: '#1677ff',
        colorBgBase: '#fff',
        fontSize: 14,
        sizeStep: 4,
        sizeUnit: 4,
        borderRadius: 6,
        wireframe: false,
    },
};
