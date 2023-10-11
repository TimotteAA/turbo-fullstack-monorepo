import { toNumber } from 'lodash';

import { createAppConfig } from '@/modules/core/helpers';

// src/config/app.config.ts
export const app = createAppConfig((configure) => ({
    port: configure.env.get('APP_PORT', (v) => toNumber(v), 3100),
    prefix: 'api',
}));
