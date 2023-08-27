import { isNil, omit } from 'lodash';

import { useStore } from 'zustand';

import { deepMerge } from '@/utils';

import type { IconType } from './constants';
import { IconStore } from './store';
import type { IconComputed, IconProps } from './types';

/**
 * 根据传入的args，返回最后的icon配置
 * @param args
 * @returns
 */
export const useIcon = (args: IconProps) => {
    const config = useStore(IconStore);
    if (isNil(config)) return null;
    // 最终对象
    const params = omit(config, ['size', 'prefix', 'classes', 'iconfont_urls']);
    // icon大小
    const csize = typeof config.size === 'number' ? `${config.size}px` : config.size;
    // css样式
    const style = { fontSize: args.style?.fontSize ?? csize, ...(args.style ?? {}) };
    // 类名
    const className = [...config.classes, args.className];
    // 如果 args 中包含 component 属性，表示要渲染的是一个自定义组件图标
    if ('component' in args) {
        const result = deepMerge<RecordAny, RecordAny>(params, {
            ...args,
            type: 'component',
            style,
            className,
        });
        return omit(result, ['iconfont']) as IconComputed;
    }
    // use iconify、svg、iconfont
    let name: string;
    let type: `${IconType}` = 'svg';
    const [prefix, ...names] = args.name.split(':');
    // 根据 prefix 的值，确定最终的图标名和图标类型
    if (prefix === 'iconfont') {
        name = `${config.prefix.iconfont}-${names.join(':')}`;
        type = 'iconfont';
    } else if (prefix === 'iconify') {
        name = names.join(':');
        type = 'iconify';
    } else {
        name = `${config.prefix.svg}-${names.join(':')}`;
        type = 'svg';
    }
    const result = deepMerge(config, {
        ...args,
        name,
        type,
        style,
        className,
    });
    return (prefix !== 'iconfont' ? omit(result, ['iconfont']) : result) as IconComputed;
};
