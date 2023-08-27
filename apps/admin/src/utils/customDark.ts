import { theme } from 'antd';
import { MappingAlgorithm } from 'antd/es/config-provider/context';

/**
 * 自定义主题算法
 * @param seedToken
 * @param mapToken
 */
const customDarkAlgorithm: MappingAlgorithm = (seedToken, mapToken) => {
    const mergeToken = theme.darkAlgorithm(seedToken, mapToken);

    return {
        ...mergeToken,
        // Layout 颜色
        colorBgLayout: '#20252b',
        // 容器颜色
        colorBgContainer: '#282c3f',
        // 悬浮类面板颜色
        colorBgElevated: '#32363e',
    };
};

export { customDarkAlgorithm };
