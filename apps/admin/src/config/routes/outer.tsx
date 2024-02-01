import ComputerIcon from '~icons/material-symbols/computer';

import { RouteOption } from '@/components/router/types';

export const outer: RouteOption = {
    path: 'frame',
    id: 'meframedia',
    meta: { name: '文件管理', icon: ComputerIcon },
    children: [
        {
            path: 'https://ant-design.antgroup.com/',
            id: 'antd.outer',
            meta: { name: 'antd文档（外链）', target: '_blank' },
        },
        {
            path: 'doc',
            id: 'antd.inner',
            meta: {
                name: '阿b（内嵌iframe）',
                iframe: true,
                iframeSrc: 'https://antdv.com/components/overview-cn',
            },
            page: 'IFRAME',
        },
    ],
};
