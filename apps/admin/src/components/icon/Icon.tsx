import AntdIcon from '@ant-design/icons';
import { Icon as Iconify } from '@iconify/react';

import clsx from 'clsx';
import { produce } from 'immer';

import { isNil } from 'lodash';

import { IconType } from './constants';
import { useIcon } from './hooks';
import type { IconComputed, IconProps } from './types';

const getAntdSvgIcon = ({ config }: { config: IconComputed }) => {
    if ('component' in config) {
        const { component, spin, rotate, className, ...rest } = config;
        return config.component({ className: clsx(className), ...rest });
    }
    const { name, iconfont, className, inline, type, spin, rotate, ...rest } = config;
    return type === IconType.ICONIFY ? (
        <Iconify icon={name} {...rest} />
    ) : (
        <svg aria-hidden="true" {...rest}>
            <use xlinkHref={name} />
        </svg>
    );
};

/**
 * @example 使用unplugins-icon的按需安装icon
 * 1. 前往https://icones.js.org/collection，找到icon后，复制名称:
 *    <Icon name="iconify-xxxxx" />
 *    <Icon name="iconify:ph:angular-logo-light" />
 *
 * 2. 借助unplugins-icon的能力：
 *    import ContentIcon from '~icons/fluent/cube-16-regular';
 *    <Icon component={ContentIcon} />
 * @param props IconProps
 * @returns
 */
const Icon = (props: IconProps) => {
    const config = useIcon(props);
    if (isNil(config)) return null;
    if ('type' in config && config.iconfont && config.type === IconType.ICONFONT) {
        const { name, iconfont: FontIcon, inline, className, type, ...rest } = config;
        return <FontIcon type={name} className={clsx(className)} {...rest} />;
    }
    const options = produce(config, (draft) => {
        if (draft.spin) draft.className.push('anticon-spin');
        if (draft.rotate) {
            draft.style.transform = draft.style.transform
                ? `${draft.style.transform} rotate(${draft.rotate})deg`
                : `rotate(${draft.rotate})deg`;
        }
    });
    return (
        <AntdIcon
            className={clsx(options.className)}
            component={() => getAntdSvgIcon({ config: options })}
        />
    );
};
export default Icon;
