import { ConfigureFactory } from '@/modules/config/types';
import { ApiConfig } from '@/modules/restful/types';

import { v1 } from './v1';

export const api: ConfigureFactory<ApiConfig> = {
    register: async (configure) => ({
        title: '基于turbopack的全栈应用后台',
        description: '个人学习用途',
        auth: true,
        docuri: 'api/docs',
        default: configure.env.get('API_DEFAULT_VERSION', 'v1'),
        enabled: [],
        versions: { v1: await v1(configure) },
    }),
};
