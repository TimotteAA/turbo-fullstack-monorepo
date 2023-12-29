import { RouteOption, TagOption } from '../restful/types';

import * as taskControllersMap from './controllers';

export const createTaskApi = () => {
    const tags: Record<'manage', TagOption[]> = {
        manage: [
            {
                name: '任务操作',
                description: '后台的定时任务操作',
            },
        ],
    };

    const routes: Record<'manage', RouteOption[]> = {
        manage: [
            {
                name: 'manage.task',
                path: '/task',
                controllers: [...Object.values(taskControllersMap)],
            },
        ],
    };

    return {
        routes,
        tags,
    };
};
