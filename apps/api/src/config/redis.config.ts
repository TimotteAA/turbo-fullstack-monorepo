import { createRedisConfig } from '../modules/redis/helpers';

export const redis = createRedisConfig((_configure) => [
    { name: 'default', host: '127.0.0.1', port: 6381 },
]);
