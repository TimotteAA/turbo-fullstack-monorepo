/**
 * 自定义repo装饰常熟
 */
export const CUSTOM_REPOSITORY_METADATA = 'CUSTOM_REPOSITORY';

/**
 * 软删除数据查询类型
 */
export enum SelectTrashMode {
    ALL = 'all',
    ONLY = 'only',
    NONE = 'none',
}

/**
 * 树形模型在删除父级后子级的处理方式
 */
export enum TreeChildrenResolve {
    DELETE = 'delete',
    UP = 'up',
    ROOT = 'root',
}
