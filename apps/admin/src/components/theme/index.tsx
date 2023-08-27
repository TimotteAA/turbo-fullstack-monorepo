import Icon from '../icon/Icon';

import { useTheme, useThemeAction } from './hooks';

/**
 * header中切换theme的组件
 * @returns
 */
const Theme = () => {
    // 当前模式
    const { mode } = useTheme();
    const { toggleMode } = useThemeAction();
    return mode === 'light' ? (
        <Icon name="iconify:ic:baseline-brightness-medium" onClick={toggleMode} />
    ) : (
        <Icon name="iconify:ic:outline-brightness-4" onClick={toggleMode} />
    );
};

export default Theme;
