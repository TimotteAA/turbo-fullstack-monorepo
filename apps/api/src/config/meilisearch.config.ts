import type { MeiliSeachModuleConfig } from '@/modules/meilisearch/types';

export const meilisearch: () => MeiliSeachModuleConfig = () => {
    return [
        {
            name: 'default',
            host: 'http://localhost:7700/',
        },
    ];
};
