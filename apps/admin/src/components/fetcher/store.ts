import { config } from '@/config';

import { deepMerge } from '@/utils';

import { createPersistStore } from '../store';

import { defaultFetcherConfig } from './_default.config';
import { FetcherConfig } from './types';

/**
 * fetcher网络请求store，默认保存state里的token
 */
export const FetcherStore = createPersistStore<FetcherConfig, { token?: string | null }>(
    () => deepMerge(defaultFetcherConfig(), config().fetcher ?? {}, 'replace'),
    {
        name: 'token',
        partialize: (state) => ({ token: state.token }),
    },
);
