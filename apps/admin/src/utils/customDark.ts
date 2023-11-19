import { theme, MappingAlgorithm } from 'antd';
import { MapToken } from 'antd/es/theme/interface';
import { SeedToken } from 'antd/es/theme/internal';

/**
 * 自定义主题算法
 * @param seedToken
 * @param mapToken
 */
const customDarkAlgorithm: MappingAlgorithm = (seedToken: SeedToken, mapToken: MapToken) => {
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
