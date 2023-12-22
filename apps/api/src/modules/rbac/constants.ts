export enum Status {
    ENABLED = 'enabled',
    DISABLED = 'disabled',
}

export enum ResourceType {
    /** 目录 */
    DIRECTORY = 'directory',
    /** 菜单 */
    MENU = 'menu',
    /** 按钮权限 */
    ACTION = 'action',
}

export const PERMISSION_CHECKERS = Symbol('permission_checkers');

export enum SystemRoles {
    USER = 'user',
    SUPER_ADMIN = 'super-admin',
}

export enum PermissionAction {
    CREATE = 'create',
    LIST = 'list',
    DETAIL = 'detail',
    UPDATE = 'update',
    DELETE = 'delete',
    RESTORE = 'restore',
    MANAGE = 'manage',
    OWNER = 'onwer',
    // 是否可以访问特定页面、资源
    VISIT = 'visit',
}
