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
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
    OWNER = 'onwer',
}
