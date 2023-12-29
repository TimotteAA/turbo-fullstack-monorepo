import { createQueueConfig } from '@/modules/queue/helpers';

export const queue = createQueueConfig(() => [{ redis: 'default' }]);
