import { RouteOption, TagOption } from '../restful/types';

import * as contentApiControllersMap from './controllers';
import * as contentManageControllersMap from './controllers/manage';

export const createContentApi = () => {
    const tags: Record<'app' | 'manage', TagOption[]> = {
        app: [
            {
                name: '文章接口',
                description: '前台文章接口',
            },
        ],
        manage: [
            { name: '分类操作', description: '对分类的增删查操作' },
            { name: '标签操作', description: '对标签的增删查操作' },
            { name: '文章操作', description: '对文章进行的增删查改及搜索等操作' },
            { name: '评论操作', description: '对评论的增删查操作' },
        ],
    };

    const routes: Record<'app' | 'manage', RouteOption[]> = {
        app: [
            {
                name: 'app.content',
                path: '/content',
                controllers: [...Object.values(contentApiControllersMap)],
            },
        ],
        manage: [
            {
                name: 'manage.content',
                path: '/content',
                controllers: [...Object.values(contentManageControllersMap)],
            },
        ],
    };

    return {
        routes,
        tags,
    };
};
