import { createFromIconfontCN } from '@ant-design/icons/lib';
import { omit } from 'lodash';

import { config } from '@/config';
import { deepMerge } from '@/utils';

import { createStore } from '../store';

import { defaultIconConfig } from './_default.config';
import type { IconState } from './types';

export const IconStore = createStore<IconState>(() => {
    const customConfig = config().icon;
    const options: IconState = deepMerge(
        defaultIconConfig,
        omit(customConfig ?? {}, ['iconfont']) as any,
        'replace',
    );
    if (customConfig?.iconfont_urls) {
        options.iconfont = createFromIconfontCN({
            scriptUrl: customConfig.iconfont_urls,
        });
    }
    return options;
});
