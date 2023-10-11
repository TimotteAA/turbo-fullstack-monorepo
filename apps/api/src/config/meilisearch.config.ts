import { createMeilliConfig } from '@/modules/meilisearch/helpers';

export const meilli = createMeilliConfig(() => [
    {
        name: 'default',
        host: 'http://localhost:7700/',
    },
]);
