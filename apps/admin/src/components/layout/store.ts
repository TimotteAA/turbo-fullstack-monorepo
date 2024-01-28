import { omit } from 'lodash';

import { config } from '@/config';
import { deepMerge } from '@/utils';

import { createPersistReduxStore } from '../store';

import { defaultLayoutConfig } from './_default.config';
import { LayoutAction, LayoutState } from './types';
import { layoutReducer } from './utils';

type PersistType = Omit<LayoutState, 'styles' | 'mobileSide' | 'menu'>;
export const LayoutStore = createPersistReduxStore<LayoutState, LayoutAction, PersistType>(
    layoutReducer,
    { ...deepMerge(defaultLayoutConfig, config().layout ?? {}), mobileSide: false },
    {
        name: 'layout-config',
        partialize: (state) => omit({ ...state }, ['styles', 'mobileSide']),
    },
);
