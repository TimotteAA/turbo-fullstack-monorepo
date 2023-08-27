import { Divider, Drawer, Switch, Tooltip } from 'antd';
import clsx from 'clsx';
import { FC, ReactNode, useCallback, useState } from 'react';

// import { SketchPicker, ColorResult } from 'react-color';

import { LayoutComponent } from '../../constants';
import { useLayout, useLayoutAction } from '../../hooks';

import { LayoutModeList, LayoutTheme, LayoutThemeList } from './constants';
import { ChangeDrawerContext, DrawerContext, useDrawer, useDrawerChange } from './hooks';

import $styles from './index.module.css';

/**
 * 布局设定
 * @returns
 */
const LayoutSetting: FC = () => {
    const { changeMode } = useLayoutAction();

    return (
        <div className={$styles.layoutMode}>
            {LayoutModeList.map((item, index) => (
                <Tooltip title={item.title} placement="bottom" key={index.toFixed()}>
                    <div
                        onClick={() => changeMode(item.type)}
                        className={clsx(['item', item.type])}
                    >
                        {/* embed的二级导航栏 */}
                        {item.type === 'embed' ? <div className="content-sidebar" /> : null}
                    </div>
                </Tooltip>
            ))}
        </div>
    );
};

const ThemeSetting: FC = () => {
    const { changeTheme: changeLayoutTheme } = useLayoutAction();
    const changeTheme = useCallback((type: `${LayoutTheme}`) => {
        // dark-dark or dark-light
        const theme = type.split('-') as Array<'light' | 'dark'>;
        if (theme.length === 2) {
            changeLayoutTheme({
                sidebar: theme[0],
                header: theme[1],
            });
        }
        console.log('change theme ', type);
    }, []);
    return (
        <div className={$styles.layoutTheme}>
            {LayoutThemeList.map((item, index) => (
                <Tooltip title={item.title} key={index.toFixed()}>
                    <div
                        className={clsx(['item', item.type])}
                        onClick={() => changeTheme(item.type)}
                    />
                </Tooltip>
            ))}
        </div>
    );
};

const Feature: FC = () => {
    const { mode, fixed, collapsed } = useLayout();
    const { changeFixed, changeCollapse } = useLayoutAction();
    return (
        <>
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                <span>固定顶栏</span>
                <Switch
                    checked={fixed.header}
                    onChange={(checked) => changeFixed(LayoutComponent.HEADER, checked)}
                />
            </div>
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                <span>固定侧边栏</span>
                <Switch
                    checked={fixed.sidebar}
                    disabled={mode === 'top'}
                    onChange={(checked) => changeFixed(LayoutComponent.SIDEBAR, checked)}
                />
            </div>
            {mode === 'embed' ? (
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                    <span>固定二级侧边栏</span>
                    <Switch
                        checked={fixed.embed}
                        onChange={(checked) => changeFixed(LayoutComponent.EMBED, checked)}
                    />
                </div>
            ) : null}
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                <span>折叠侧边栏</span>
                <Switch
                    checked={collapsed}
                    disabled={mode === 'embed' || mode === 'top'}
                    onChange={(checked) => changeCollapse(checked)}
                />
            </div>
        </>
    );
};

const DrawerProvider: FC<{ children?: ReactNode }> = ({ children }) => {
    const [show, changeShow] = useState(false);
    const changeStatus = useCallback(changeShow, []);
    return (
        <DrawerContext.Provider value={show}>
            <ChangeDrawerContext.Provider value={changeStatus}>
                {children}
            </ChangeDrawerContext.Provider>
        </DrawerContext.Provider>
    );
};

// const ColorSetting = () => {
//     const colors = useColors();
//     const { changeColor } = useColorDispatch();
//     const [display, setDisplay] = useState<{ [key in NonNullable<keyof ColorConfig>]: boolean }>({
//         primary: false,
//         info: false,
//         success: false,
//         warning: false,
//         error: false,
//     });
//     const closePickers = useCallback(() => {
//         setDisplay(
//             produce((state) => {
//                 Object.keys(state).forEach((key) => {
//                     state[key] = false;
//                 });
//             }),
//         );
//     }, []);
//     const togglePicker = useCallback((picker: keyof ColorConfig) => {
//         closePickers();
//         setDisplay(
//             produce((state) => {
//                 state[picker] = !state[picker];
//             }),
//         );
//     }, []);
//     const changeAppColor = useCallback((color: ColorResult['rgb'], type: keyof ColorConfig) => {
//         const rgba = `rgba(${color.r},${color.g},${color.b},${color.a ?? 1})`;
//         changeColor(type, rgba);
//     }, []);
//     return (
//         <div className={style.colorSetting}>
//             {ColorList.map((item, index) => (
//                 <Tooltip title={item.title} placement="bottom" key={index.toString()}>
//                     <div className="item">
//                         <div className="swatch" onClick={() => togglePicker(item.type)}>
//                             <div
//                                 className="swatch-color"
//                                 style={{ backgroundColor: colors[item.type] }}
//                             />
//                         </div>
//                         {display[item.type] ? (
//                             <div className="picker-popover">
//                                 <div className="picker-cover" onClick={closePickers} />
//                                 <SketchPicker
//                                     color={colors[item.type]}
//                                     onChangeComplete={(color) =>
//                                         changeAppColor(color.rgb, item.type)
//                                     }
//                                 />
//                             </div>
//                         ) : null}
//                     </div>
//                 </Tooltip>
//             ))}
//         </div>
//     );
// };

const DrawerView: FC = () => {
    const open = useDrawer();
    const changeVisible = useDrawerChange();

    return (
        <Drawer
            title="界面设置"
            placement="right"
            size="default"
            onClose={() => changeVisible(false)}
            open={open}
        >
            <Divider>布局</Divider>
            <LayoutSetting />
            <Divider>风格</Divider>
            <ThemeSetting />
            <Divider>功能</Divider>
            <Feature />
        </Drawer>
    );
};

/**
 * 配置drawer
 * @param param0
 * @returns
 */
export const ConfigDrawer: FC<{ children?: ReactNode }> = ({ children }) => (
    <DrawerProvider>
        {children}
        <DrawerView />
    </DrawerProvider>
);
