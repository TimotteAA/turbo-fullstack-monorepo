import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntdApp, ConfigProvider, MappingAlgorithm, theme } from 'antd';
import { ThemeConfig } from 'antd/es/config-provider/context';
import 'dayjs/locale/zh-cn';
import { produce } from 'immer';
import { useEffect, useState } from 'react';

import { Fetcher } from './components/fetcher/provider';
import Router from './components/router/router';
import { useAuxiliaryListener, useTheme, useThemeListener } from './components/theme/hooks';
import { customDarkAlgorithm } from './utils/customDark';

const App = () => {
    useThemeListener();
    useAuxiliaryListener();
    const { mode, compact, seed } = useTheme();
    const [algorithm, setAlgorithm] = useState<MappingAlgorithm[]>([theme.defaultAlgorithm]);
    const [antdTheme, setAntdTheme] = useState<ThemeConfig>({
        components: {
            Tabs: {
                cardPaddingSM: '0.3rem',
                horizontalItemGutter: 50,
                cardGutter: 10,
                titleFontSizeSM: 12,
                horizontalMargin: '0',
            },
        },
    });

    useEffect(() => {
        if (!compact) {
            // setAlgorithm(mode === 'light' ? [theme.defaultAlgorithm] : [theme.darkAlgorithm]);
            setAlgorithm(mode === 'light' ? [theme.defaultAlgorithm] : [customDarkAlgorithm]);
        } else {
            setAlgorithm(
                mode === 'light'
                    ? [theme.defaultAlgorithm, theme.compactAlgorithm]
                    : [customDarkAlgorithm, theme.compactAlgorithm],
            );
        }
        if (mode === 'dark') {
            setAntdTheme((state) =>
                produce(state, (draft) => {
                    draft.token = {
                        colorText: 'rgb(175 166 153 / 85%)',
                    };
                    draft.components!.Tabs!.itemSelectedColor = 'rgb(208 208 208 / 88%)';
                }),
            );
        } else {
            setAntdTheme((state) =>
                produce(state, (draft) => {
                    draft.token = {
                        colorText: 'rgb(60 60 60 /88%)',
                    };
                    draft.components!.Tabs!.itemSelectedColor = 'rgb(80 80 80 /88%)';
                }),
            );
        }
    }, [mode, compact]);

    return (
        <ConfigProvider
            theme={{
                algorithm,
                ...antdTheme,
                token: {
                    ...seed,
                },
            }}
        >
            {/* 取消 :where定义的Antd样式，并解决与tailwind的样式冲突问题 */}
            <StyleProvider hashPriority="high">
                <AntdApp>
                    <Fetcher>
                        <Router />
                    </Fetcher>
                </AntdApp>
            </StyleProvider>
        </ConfigProvider>
    );
};

export default App;
