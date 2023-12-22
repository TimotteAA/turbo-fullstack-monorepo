export const ALLOW_GUEST_KEY = 'ALLOW_GUEST_KEY';

export enum UserOrderBy {
    'CREATE' = 'createdAt',
    'UPDATE' = 'updatedAT',
}

export enum MessageType {
    /** 有人发表了评论 */
    COMMENT = 'comment',
    /** message */
    MESSAGE = 'message',
    /** 其他类型的消息，比如有人关注了你、xxx事项完成等 */
    OTHERS = 'others',
}
