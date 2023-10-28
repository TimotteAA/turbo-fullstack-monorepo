import { createRedisConfig } from '@/modules/redis/helpers';

export const redis = createRedisConfig(() => [
    {
        name: 'default',
        connectOptions: {
            host: 'localhost',
            port: 6380,
        },
    },
]);
