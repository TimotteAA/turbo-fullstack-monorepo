import type { IconFontProps as DefaultIconFontProps } from '@ant-design/icons/lib/components/IconFont';
import type { CSSProperties, FC, RefAttributes, SVGProps } from 'react';
// types for native css
import 'csstype';

import type { IconPrefixType, IconType } from './constants';

/**
 * icon图标名称约束
 */
export type IconName = `${IconPrefixType}:${string}`;

/**
 * icon的props
 */
export type IconComponent = FC<BaseElementProps>;

/**
 * icon配置
 */
export type IconConfig<T extends RecordAnyOrNever = RecordNever> = RecordScalable<
    {
        size?: number | string;
        classes?: string[];
        style?: CSSProperties;
        /** 前缀 */
        prefix?: { svg?: string; iconfont?: string };
        /** iconfont urls */
        iconfont_urls?: string | string[];
    },
    T
>;

/**
 * icon状态
 */
export type IconState<T extends RecordAnyOrNever = RecordNever> = RecordScalable<
    Required<Omit<IconConfig, 'iconfont_urls'>> & {
        // 根据iconfont_urls创建iconfont组件
        iconfont?: FC<DefaultIconFontProps<string>>;
    },
    T
>;

/**
 * 最终的icon参数类型
 */
export type IconComputed = {
    spin?: boolean;
    rotate?: number;
    className: string[];
    style: CSSProperties;
} & (
    | {
          name: string;
          type: `${IconType}`;
          inline?: boolean;
          iconfont?: FC<DefaultIconFontProps<string>>;
      }
    | {
          component: FC<BaseElementProps>;
      }
);

/**
 * 基本icon参数
 */
export interface BaseIconProps extends Omit<BaseElementProps, 'className' | 'name' | 'inline'> {
    className?: string;
    spin?: boolean;
    rotate?: number;
}

/**
 * svg参数，名称指定icon来源
 */
export interface SvgProps extends BaseIconProps {
    name: IconName;
    component?: never;
    inline?: boolean;
}

/**
 * 自定义icon component，即对某些Icon的封装
 */
export interface ComponetProps extends BaseIconProps {
    name?: never;
    component: IconComponent;
}

export type IconProps = SvgProps | ComponetProps;

type BaseElementProps = RefAttributes<HTMLSpanElement> & SVGProps<SVGSVGElement>;
