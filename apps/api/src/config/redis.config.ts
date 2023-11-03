import { createRedisConfig } from '../modules/redis/helpers';

export const redis = createRedisConfig(() => ({
    default: {
        host: 'localhost',
        port: 6380,
    },
}));
