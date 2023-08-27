/**
 * 文章格式
 */
export enum PostBodyType {
    HTML = 'html',
    MD = 'md',
}

/**
 * 文章排序字段
 */
export enum PostOrderType {
    CREATEDAT = 'createdAt',
    UPDATEDAT = 'updatedAt',
    PUBLISHED = 'publishedAt',
    CUSTOM = 'custom',
}
